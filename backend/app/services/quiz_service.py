"""
LearnGraph — Quiz Service
AI-assisted quiz generation, answer scoring, weak concept detection, and XP rewards.
"""

from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.quiz_generator import QuizGenerator
from app.core.exceptions import NotFoundError
from app.graph.graph_service import GraphService
from app.models.answer import Answer
from app.models.enums import QuestionType, QuizType
from app.models.question import Question
from app.models.quiz import Quiz
from app.models.quiz_result import QuizResult
from app.models.weak_concept import WeakConcept
from app.repositories.quiz_repository import QuizRepository
from app.repositories.student_repository import StudentRepository
from app.schemas.quiz import (
    GenerateQuizRequest,
    QuestionReview,
    QuizResponse,
    QuizResultResponse,
    QuizSubmission,
)


class QuizService:
    """Orchestrates quiz creation, dynamic AI questions, and assessment analytics."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._quiz_repo = QuizRepository(session)
        self._student_repo = StudentRepository(session)
        self._ai_generator = QuizGenerator()
        self._graph_service = GraphService()

    async def generate_quiz(
        self, req: GenerateQuizRequest, student_id: UUID
    ) -> QuizResponse:
        """Call AI QuizGenerator to build a targeted quiz."""
        weak_concepts_records = await self._student_repo.get_weak_concepts(student_id)
        weak_names = [w.concept_name for w in weak_concepts_records]

        generated = await self._ai_generator.generate_quiz(
            topic=req.topic_name or "Computer Science Foundations",
            difficulty=req.difficulty,
            num_questions=req.num_questions,
            question_types=["mcq"],
            student_weak_concepts=weak_names if req.focus_weak_concepts else None,
            content_context=None,
        )

        quiz = Quiz(
            title=generated.title,
            topic_id=req.topic_id,
            quiz_type=QuizType.adaptive if req.focus_weak_concepts else QuizType.practice,
            total_questions=len(generated.questions),
            time_limit_seconds=len(generated.questions) * 90,
            passing_score=70.0,
            is_ai_generated=True,
            created_by_id=student_id,
        )
        self._session.add(quiz)
        await self._session.flush()

        for i, q in enumerate(generated.questions):
            question = Question(
                quiz_id=quiz.id,
                question_text=q.question_text,
                question_type=QuestionType.mcq,
                difficulty=q.difficulty,
                concept_tested=q.concept_tested,
                explanation=q.explanation,
                order_index=i,
                points=1,
            )
            self._session.add(question)
            await self._session.flush()

            for opt in q.options:
                is_corr = opt.strip().lower() == q.correct_answer.strip().lower()
                ans = Answer(
                    question_id=question.id,
                    answer_text=opt,
                    is_correct=is_corr,
                )
                self._session.add(ans)

        await self._session.flush()
        full_quiz = await self._quiz_repo.get_with_questions(quiz.id)
        return QuizResponse.model_validate(full_quiz)

    async def submit_quiz(
        self, submission: QuizSubmission, student_id: UUID
    ) -> QuizResultResponse:
        """Score answers, detect weaknesses, grant XP, and update Neo4j mastery."""
        quiz = await self._quiz_repo.get_with_questions(submission.quiz_id)
        if not quiz:
            raise NotFoundError("Quiz not found")

        answers_map = {ans.question_id: ans.selected_answer for ans in submission.answers}
        total_questions = len(quiz.questions)
        correct_count = 0
        reviews: List[QuestionReview] = []
        weak_identified = []

        for q in quiz.questions:
            student_answer = answers_map.get(q.id, "")
            correct_ans_obj = next((a for a in q.answers if a.is_correct), None)
            correct_str = correct_ans_obj.answer_text if correct_ans_obj else ""
            is_correct = student_answer.strip().lower() == correct_str.strip().lower()

            if is_correct:
                correct_count += 1
            else:
                if q.concept_tested:
                    weak_identified.append(q.concept_tested)

            reviews.append(
                QuestionReview(
                    question_text=q.question_text,
                    your_answer=student_answer,
                    correct_answer=correct_str,
                    is_correct=is_correct,
                    explanation=q.explanation or "Standard concept explanation",
                )
            )

        percentage = round((correct_count / total_questions) * 100.0, 1) if total_questions else 0.0
        passed = percentage >= quiz.passing_score

        # Save result record
        quiz_result = QuizResult(
            student_id=student_id,
            quiz_id=quiz.id,
            score=float(correct_count),
            max_score=float(total_questions),
            percentage=percentage,
            time_taken_seconds=submission.time_taken_seconds,
            answers_given=[a.model_dump(mode="json") for a in submission.answers],
            weak_concepts_identified=weak_identified,
            passed=passed,
        )
        self._session.add(quiz_result)

        # Record weak concepts in DB
        for w_concept in set(weak_identified):
            wc = WeakConcept(
                student_id=student_id,
                concept_name=w_concept,
                subject_area="General",
                failure_count=1,
                last_tested_at=quiz_result.created_at,
            )
            self._session.add(wc)

        # Reward XP: 50 XP per passed quiz + 10 XP per correct question
        xp_earned = (50 if passed else 10) + (correct_count * 10)
        await self._student_repo.add_xp(student_id, xp_earned)

        # Update Neo4j knowledge graph
        if quiz.topic_id:
            try:
                if passed:
                    await self._graph_service.mark_topic_mastered(student_id, quiz.topic_id, percentage / 100.0)
                else:
                    await self._graph_service.mark_topic_weak(student_id, quiz.topic_id, failure_count=1)
            except Exception:
                pass

        await self._session.flush()
        await self._session.refresh(quiz_result)

        return QuizResultResponse(
            id=quiz_result.id,
            quiz_id=quiz.id,
            score=quiz_result.score,
            max_score=quiz_result.max_score,
            percentage=quiz_result.percentage,
            passed=quiz_result.passed,
            time_taken_seconds=quiz_result.time_taken_seconds,
            weak_concepts_identified=weak_identified,
            correct_count=correct_count,
            wrong_count=total_questions - correct_count,
            review=reviews,
        )
