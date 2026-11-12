import { useState, useMemo } from "react";
import {
  FileText,
  Sparkles,
  CheckCircle2,
  Clock,
  Copy,
  BrainCircuit,
  Lightbulb,
  Check,
  Play,
  Layers,
  GraduationCap,
  BookOpen,
  Target,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { QUIZ_HIERARCHY } from "@/data/quizCurriculumData";
import { adaptiveQuizEngine } from "@/services/adaptiveQuizEngine";
import type {
  PersonalizedQuizPayload,
  QuestionTypeEnum,
  EducationLevel,
} from "@/types/aiFeatures";
import type { EducationLevelTier, SupportedQuestionType } from "@/types/quiz";

const ALL_QUESTION_TYPES: QuestionTypeEnum[] = [
  "MCQ",
  "True/False",
  "Fill in the blanks",
  "Coding",
  "Short answer",
  "Case study",
];

interface PersonalizedQuizGeneratorProps {
  initialWeakConcepts?: string[];
  initialMastery?: number;
  onBack?: () => void;
  onStartStandardQuiz?: (generated: ReturnType<typeof adaptiveQuizEngine.generateQuiz>) => void;
}

export function PersonalizedQuizGenerator({
  initialWeakConcepts = ["Hydronium Ion Dissociation", "Neutralization Equations", "pH Indicator Ranges"],
  initialMastery = 65,
  onBack,
  onStartStandardQuiz,
}: PersonalizedQuizGeneratorProps) {
  // ── 5-Level Topic Hierarchy States ─────────────────────────────────────────
  const [selectedLevelId, setSelectedLevelId] = useState<EducationLevelTier>("School");
  const [selectedGradeId, setSelectedGradeId] = useState<string>("class-10");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("c10-science");
  const [selectedChapterId, setSelectedChapterId] = useState<string>("c10-sci-ch2");
  const [selectedTopic, setSelectedTopic] = useState<string>("Properties of Acids & Bases");

  // Filtered dropdown lists derived from canonical hierarchy
  const activeLevel = useMemo(
    () => QUIZ_HIERARCHY.levels.find((l) => l.id === selectedLevelId) || QUIZ_HIERARCHY.levels[0],
    [selectedLevelId]
  );

  const availableGrades = activeLevel.gradesOrExams;
  const activeGrade = useMemo(
    () => availableGrades.find((g) => g.id === selectedGradeId) || availableGrades[0],
    [availableGrades, selectedGradeId]
  );

  const availableSubjects = activeGrade?.subjects || [];
  const activeSubject = useMemo(
    () => availableSubjects.find((s) => s.id === selectedSubjectId) || availableSubjects[0],
    [availableSubjects, selectedSubjectId]
  );

  const availableChapters = activeSubject?.chapters || [];
  const activeChapter = useMemo(
    () => availableChapters.find((ch) => ch.id === selectedChapterId) || availableChapters[0],
    [availableChapters, selectedChapterId]
  );

  const availableTopics = activeChapter?.topics || [];

  // ── Quiz Settings & Parameters ─────────────────────────────────────────────
  const [mastery, setMastery] = useState(initialMastery);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard" | "Adaptive">("Medium");
  const [questionCount, setQuestionCount] = useState<5 | 10 | 20 | 30 | 50>(5);
  const [onlyPreviousYearQuestions, setOnlyPreviousYearQuestions] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<QuestionTypeEnum[]>([
    "MCQ",
    "True/False",
    "Fill in the blanks",
    "Short answer",
  ]);
  const [weakConcepts, setWeakConcepts] = useState<string[]>(initialWeakConcepts);
  const [newConceptInput, setNewConceptInput] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [quizPayload, setQuizPayload] = useState<PersonalizedQuizPayload | null>(null);
  const [activeTab, setActiveTab] = useState<"quiz" | "json">("quiz");
  const [copied, setCopied] = useState(false);

  // Student interaction states
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<string, boolean>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, number>>({});

  const toggleType = (t: QuestionTypeEnum) => {
    if (selectedTypes.includes(t)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter((x) => x !== t));
      }
    } else {
      setSelectedTypes([...selectedTypes, t]);
    }
  };

  const handleAddConcept = () => {
    if (newConceptInput.trim() && !weakConcepts.includes(newConceptInput.trim())) {
      setWeakConcepts([...weakConcepts, newConceptInput.trim()]);
      setNewConceptInput("");
    }
  };

  const handleRemoveConcept = (c: string) => {
    setWeakConcepts(weakConcepts.filter((x) => x !== c));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setUserAnswers({});
    setSubmittedQuestions({});
    setRevealedHints({});

    try {
      // Generate dynamically from the topic engine
      const generated = adaptiveQuizEngine.generateQuiz({
        educationLevel: selectedLevelId,
        gradeOrExam: activeGrade?.label || "Class 10",
        subject: activeSubject?.label || "Science",
        chapter: activeChapter?.label || "Acids, Bases and Salts",
        topic: selectedTopic || availableTopics[0] || "Properties of Acids & Bases",
        difficulty,
        questionCount,
        onlyPreviousYearQuestions,
        targetWeakConcepts: weakConcepts,
      });

      // Transform into PersonalizedQuizPayload format
      const payload: PersonalizedQuizPayload = {
        title: `${selectedTopic} Diagnostic Quiz`,
        targetMasteryScore: mastery,
        targetedWeakConcepts: weakConcepts,
        difficulty: (difficulty === "Adaptive" ? "Intermediate" : difficulty) as EducationLevel,
        totalQuestions: generated.questions.length,
        questionTypes: selectedTypes,
        questions: generated.questions.map((q, idx) => ({
          id: q.id,
          type: (q.type === "Multiple Choice" ? "MCQ" : q.type === "True/False" ? "True/False" : "MCQ") as QuestionTypeEnum,
          concept: q.topic || selectedTopic,
          difficulty: (q.difficulty === "Adaptive" ? "Intermediate" : q.difficulty) as EducationLevel,
          bloomsTaxonomyLevel: idx % 3 === 0 ? "Apply" : idx % 3 === 1 ? "Analyze" : "Understand",
          estimatedSolvingTime: `${q.estimatedTimeSeconds || 60}s`,
          question: q.questionText,
          codeSnippet: q.mathExpression || undefined,
          options: q.options?.map((o) => `${o.label}. ${o.text}`) || [],
          correctAnswer: q.options?.[q.correctAnswerIndex]
            ? `${q.options[q.correctAnswerIndex].label}. ${q.options[q.correctAnswerIndex].text}`
            : "Option A",
          explanation: q.explanation,
          hints: [
            `Recall the primary principle associated with ${selectedTopic}.`,
            q.tags ? `Related syllabus tags: ${q.tags.join(", ")}` : "Consider problem constraints.",
          ],
        })),
      };

      setQuizPayload(payload);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerChange = (qId: string, val: string) => {
    if (submittedQuestions[qId]) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleQuestionSubmit = (qId: string) => {
    setSubmittedQuestions((prev) => ({ ...prev, [qId]: true }));
  };

  const toggleHint = (qId: string, totalHints: number) => {
    setRevealedHints((prev) => {
      const current = prev[qId] || 0;
      return { ...prev, [qId]: current < totalHints ? current + 1 : current };
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto p-4 md:p-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-600/25">
            <Sparkles size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                AI Diagnostic & Previous-Year Quiz Engine
              </span>
              <Tag tone="purple">Topic-Targeted</Tag>
            </div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              Adaptive Quiz Lab
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="secondary" className="py-1 px-3 text-xs" onClick={onBack}>
              Back to Standard View
            </Button>
          )}
          {quizPayload && (
            <div className="flex items-center rounded-xl bg-[var(--soft)] p-1 border border-[var(--line)]">
              <button
                onClick={() => setActiveTab("quiz")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  activeTab === "quiz" ? "bg-[var(--surface)] shadow-xs" : "text-[var(--muted)]"
                }`}
              >
                Interactive Test ({quizPayload.questions.length})
              </button>
              <button
                onClick={() => setActiveTab("json")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  activeTab === "json" ? "bg-[var(--surface)] shadow-xs" : "text-[var(--muted)]"
                }`}
              >
                Output JSON
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs Configurator */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
              <BrainCircuit size={16} className="text-purple-600" />
              Syllabus Hierarchy & Constraints
            </h3>

            {/* 1. Education Level */}
            <div>
              <label className="text-xs font-medium text-[var(--muted)] block mb-1">
                1. Education Level
              </label>
              <select
                value={selectedLevelId}
                onChange={(e) => {
                  const newLvl = e.target.value as EducationLevelTier;
                  setSelectedLevelId(newLvl);
                  const lvlObj = QUIZ_HIERARCHY.levels.find((l) => l.id === newLvl);
                  if (lvlObj?.gradesOrExams[0]) {
                    setSelectedGradeId(lvlObj.gradesOrExams[0].id);
                    const grObj = lvlObj.gradesOrExams[0];
                    if (grObj.subjects[0]) {
                      setSelectedSubjectId(grObj.subjects[0].id);
                      if (grObj.subjects[0].chapters[0]) {
                        setSelectedChapterId(grObj.subjects[0].chapters[0].id);
                        setSelectedTopic(grObj.subjects[0].chapters[0].topics[0] || "");
                      }
                    }
                  }
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--foreground)] focus:ring-2 focus:ring-purple-500 font-medium"
              >
                {QUIZ_HIERARCHY.levels.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Class / Degree / Exam */}
            <div>
              <label className="text-xs font-medium text-[var(--muted)] block mb-1">
                2. Class / Degree / Exam
              </label>
              <select
                value={selectedGradeId}
                onChange={(e) => {
                  const newGradeId = e.target.value;
                  setSelectedGradeId(newGradeId);
                  const grObj = availableGrades.find((g) => g.id === newGradeId);
                  if (grObj?.subjects[0]) {
                    setSelectedSubjectId(grObj.subjects[0].id);
                    if (grObj.subjects[0].chapters[0]) {
                      setSelectedChapterId(grObj.subjects[0].chapters[0].id);
                      setSelectedTopic(grObj.subjects[0].chapters[0].topics[0] || "");
                    }
                  }
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--foreground)] focus:ring-2 focus:ring-purple-500 font-medium"
              >
                {availableGrades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Subject */}
            <div>
              <label className="text-xs font-medium text-[var(--muted)] block mb-1">
                3. Subject
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  const newSubId = e.target.value;
                  setSelectedSubjectId(newSubId);
                  const subObj = availableSubjects.find((s) => s.id === newSubId);
                  if (subObj?.chapters[0]) {
                    setSelectedChapterId(subObj.chapters[0].id);
                    setSelectedTopic(subObj.chapters[0].topics[0] || "");
                  }
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--foreground)] focus:ring-2 focus:ring-purple-500 font-medium"
              >
                {availableSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Chapter */}
            <div>
              <label className="text-xs font-medium text-[var(--muted)] block mb-1">
                4. Chapter
              </label>
              <select
                value={selectedChapterId}
                onChange={(e) => {
                  const newChId = e.target.value;
                  setSelectedChapterId(newChId);
                  const chObj = availableChapters.find((ch) => ch.id === newChId);
                  if (chObj?.topics[0]) {
                    setSelectedTopic(chObj.topics[0]);
                  }
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--foreground)] focus:ring-2 focus:ring-purple-500 font-medium"
              >
                {availableChapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Topic (Crucial!) */}
            <div>
              <label className="text-xs font-medium text-[var(--muted)] block mb-1">
                5. Target Topic <span className="text-purple-600 font-bold">*</span>
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border-2 border-purple-500/40 bg-[var(--bg)] text-[var(--foreground)] focus:ring-2 focus:ring-purple-500 font-semibold text-purple-700 dark:text-purple-300"
              >
                {availableTopics.map((top) => (
                  <option key={top} value={top}>
                    {top}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-[var(--muted)] block mt-1">
                ✓ The quiz will contain ONLY questions mapped to this selected topic.
              </span>
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="text-xs font-medium text-[var(--muted)] block mb-1">
                Difficulty Level
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(["Easy", "Medium", "Hard", "Adaptive"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                      difficulty === d
                        ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                        : "bg-[var(--soft)] border-[var(--line)] text-[var(--muted)]"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count Selector (5, 10, 20, 30, 50) */}
            <div>
              <label className="text-xs font-medium text-[var(--muted)] block mb-1">
                Number of Questions
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {([5, 10, 20, 30, 50] as const).map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => setQuestionCount(cnt)}
                    className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
                      questionCount === cnt
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-[var(--soft)] border-[var(--line)] text-[var(--muted)]"
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
            </div>

            {/* Source Toggle: Previous-Year Questions vs All */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--soft)]/60 border border-[var(--line)]">
              <div>
                <span className="text-xs font-semibold block text-[var(--foreground)]">
                  Previous-Year Questions (PYQ) Only
                </span>
                <span className="text-[10px] text-[var(--muted)]">
                  Filter for official public previous examination questions
                </span>
              </div>
              <input
                type="checkbox"
                checked={onlyPreviousYearQuestions}
                onChange={(e) => setOnlyPreviousYearQuestions(e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded"
              />
            </div>

            {/* Targeted Weak Concepts List */}
            <div>
              <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">
                Targeted Weak Concepts ({weakConcepts.length})
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {weakConcepts.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-red-500/10 text-red-600 border border-red-500/20"
                  >
                    {c}
                    <button
                      onClick={() => handleRemoveConcept(c)}
                      className="hover:text-red-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add specific concept..."
                  value={newConceptInput}
                  onChange={(e) => setNewConceptInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddConcept()}
                  className="flex-1 px-3 py-1 text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)]"
                />
                <Button
                  variant="secondary"
                  className="py-1 px-2.5 text-xs"
                  onClick={handleAddConcept}
                >
                  Add
                </Button>
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full py-2.5 text-xs shadow-md shadow-purple-600/20 gap-2 mt-2"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Generating Topic Quiz...
                </>
              ) : (
                <>
                  <Sparkles size={14} /> Generate {selectedTopic} Quiz
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Output: Interactive Test or JSON */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {!quizPayload && !isGenerating && (
            <div className="h-full min-h-[420px] flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-[var(--line)] text-center bg-[var(--surface)]/50">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-4">
                <FileText size={26} />
              </div>
              <h3 className="text-base font-bold text-[var(--foreground)]">
                Ready to Generate Topic Quiz
              </h3>
              <p className="text-xs text-[var(--muted)] max-w-sm mt-1 mb-4 leading-relaxed">
                Selected: <strong>{activeGrade?.label}</strong> → <strong>{activeSubject?.label}</strong> → <strong>{selectedTopic}</strong>.
              </p>
              <Button variant="primary" className="py-1.5 px-4 text-xs gap-1.5" onClick={handleGenerate}>
                <Sparkles size={13} /> Generate Quiz for {selectedTopic}
              </Button>
            </div>
          )}

          {isGenerating && (
            <div className="h-full min-h-[420px] flex flex-col items-center justify-center p-8 rounded-2xl border border-[var(--line)] text-center bg-[var(--surface)]">
              <div className="w-14 h-14 rounded-full border-4 border-purple-600/20 border-t-purple-600 animate-spin mb-4" />
              <h3 className="text-base font-bold text-[var(--foreground)]">
                Synthesizing {selectedTopic} Questions
              </h3>
              <p className="text-xs text-[var(--muted)] mt-1">
                Checking previous-year question archives, formulating step-by-step derivations & boundary conditions...
              </p>
            </div>
          )}

          {quizPayload && !isGenerating && (
            <>
              {activeTab === "quiz" ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between text-xs text-[var(--muted)] px-1">
                    <span>
                      TOPIC: <strong className="text-purple-600">{selectedTopic}</strong> ({quizPayload.questions.length} Qs)
                    </span>
                    <span>
                      DIFFICULTY: <strong>{quizPayload.difficulty}</strong>
                    </span>
                  </div>

                  {quizPayload.questions.map((q, idx) => {
                    const isSubmitted = submittedQuestions[q.id];
                    const currentAnswer = userAnswers[q.id] || "";
                    const hintsToShow = revealedHints[q.id] || 0;

                    return (
                      <div
                        key={q.id}
                        className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-3.5"
                      >
                        {/* Question Meta Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-purple-600/10 text-purple-600 font-bold text-xs flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <Tag tone="purple">{q.type}</Tag>
                            <Tag tone="blue">{q.concept}</Tag>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                            <span className="flex items-center gap-1">
                              <Clock size={12} /> {q.estimatedSolvingTime}
                            </span>
                            <Tag tone="zinc">{q.difficulty}</Tag>
                          </div>
                        </div>

                        {/* Question Body */}
                        <div>
                          <h4 className="text-sm md:text-base font-bold text-[var(--foreground)] leading-snug">
                            {q.question}
                          </h4>
                        </div>

                        {/* Math Formula or Equation */}
                        {q.codeSnippet && (
                          <div className="p-3 rounded-xl bg-[var(--bg)] font-mono text-xs text-indigo-600 dark:text-indigo-400 overflow-x-auto border border-[var(--line)]">
                            <pre>{q.codeSnippet}</pre>
                          </div>
                        )}

                        {/* Options */}
                        {q.options && q.options.length > 0 && (
                          <div className="grid grid-cols-1 gap-2 pt-1">
                            {q.options.map((opt) => {
                              const isSelected = currentAnswer === opt;
                              const isCorrect = opt === q.correctAnswer;
                              let btnStyle = "bg-[var(--soft)]/60 hover:bg-[var(--soft)] border-[var(--line)]";

                              if (isSubmitted) {
                                if (isCorrect) {
                                  btnStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-700 font-bold";
                                } else if (isSelected) {
                                  btnStyle = "bg-red-500/10 border-red-500 text-red-700";
                                }
                              } else if (isSelected) {
                                btnStyle = "bg-purple-500/10 border-purple-500 text-purple-700 font-semibold";
                              }

                              return (
                                <button
                                  key={opt}
                                  onClick={() => handleAnswerChange(q.id, opt)}
                                  disabled={isSubmitted}
                                  className={`w-full p-2.5 rounded-xl border text-xs text-left transition-all ${btnStyle}`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Hints Accordion */}
                        {q.hints && q.hints.length > 0 && (
                          <div className="space-y-1">
                            {hintsToShow > 0 && (
                              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 space-y-1">
                                {q.hints.slice(0, hintsToShow).map((h, hIdx) => (
                                  <div key={hIdx} className="flex items-start gap-1.5">
                                    <Lightbulb size={13} className="text-amber-500 shrink-0 mt-0.5" />
                                    <span>
                                      <strong>Hint {hIdx + 1}:</strong> {h}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {hintsToShow < q.hints.length && (
                              <button
                                onClick={() => toggleHint(q.id, q.hints.length)}
                                className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                              >
                                <Lightbulb size={13} /> Need a hint? ({hintsToShow}/{q.hints.length})
                              </button>
                            )}
                          </div>
                        )}

                        {/* Explanation on Submit */}
                        {isSubmitted && (
                          <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed space-y-1">
                            <strong className="block text-indigo-700 dark:text-indigo-300">
                              ✓ Solution & Conceptual Derivation:
                            </strong>
                            <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                              Correct Answer: {q.correctAnswer}
                            </p>
                            <p>{q.explanation}</p>
                          </div>
                        )}

                        {/* Check Answer Button */}
                        {!isSubmitted && (
                          <div className="flex justify-end pt-1">
                            <Button
                              variant="secondary"
                              className="py-1 px-3 text-xs"
                              onClick={() => handleQuestionSubmit(q.id)}
                              disabled={!currentAnswer}
                            >
                              Check Answer
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* JSON Viewer Tab */
                <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-purple-600">
                      Standardized Quiz Payload JSON
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(quizPayload, null, 2));
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="px-3 py-1 rounded-lg bg-[var(--soft)] hover:bg-[var(--line)] text-xs flex items-center gap-1.5"
                    >
                      {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                      <span>{copied ? "Copied" : "Copy JSON"}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-[var(--bg)] font-mono text-xs text-purple-400 max-h-[500px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {JSON.stringify(quizPayload, null, 2)}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
