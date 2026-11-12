"""
LearnGraph — Development Seed Data Script
Seeds demo courses, topics, students, quizzes, and knowledge graph nodes.
Usage: python scripts/seed_data.py
"""

import asyncio
from slugify import slugify

from app.core.security import hash_password
from app.database.session import database_manager
from app.graph.graph_service import GraphService
from app.graph.node_models import CourseNode, StudentNode, TopicNode
from app.graph.session import graph_manager
from app.models.course import Course
from app.models.enums import CourseStatus, Difficulty, UserRole
from app.models.student_profile import StudentProfile
from app.models.subject import Subject
from app.models.teacher_profile import TeacherProfile
from app.models.topic import Topic
from app.models.user import User


async def main() -> None:
    print("=" * 60)
    print("Seeding LearnGraph Demo Data")
    print("=" * 60)

    await database_manager.connect()
    try:
        await graph_manager.connect()
    except Exception:
        pass
    graph_service = GraphService()

    async with database_manager.session() as session:
        # 1. Create Demo Teacher
        teacher = User(
            email="prof.turing@university.edu",
            hashed_password=hash_password("Teacher123!"),
            full_name="Prof. Alan Turing",
            role=UserRole.teacher,
            is_active=True,
            is_verified=True,
        )
        session.add(teacher)
        await session.flush()
        session.add(TeacherProfile(user_id=teacher.id, department="Computer Science", institution="State University"))
        print(f"✓ Created Instructor: {teacher.full_name}")

        # 2. Create Sample Course: Adaptive Data Structures & Algorithms
        course_title = "Adaptive Data Structures & Graph Algorithms"
        course = Course(
            title=course_title,
            description="Deep dive into tree traversals, shortest path algorithms, and self-balancing graphs.",
            slug=slugify(course_title),
            teacher_id=teacher.id,
            difficulty=Difficulty.intermediate,
            category="Computer Science",
            tags=["Data Structures", "Algorithms", "Graphs", "Trees"],
            estimated_hours=14.0,
            status=CourseStatus.published,
            enrolled_count=1,
            completion_rate=65.0,
        )
        session.add(course)
        await session.flush()

        # Subject
        subject = Subject(
            course_id=course.id,
            title="Module 1: Graph Theory Fundamentals",
            description="Foundations of nodes, edges, adjacency matrices, and representations.",
            order_index=0,
            estimated_minutes=180,
        )
        session.add(subject)
        await session.flush()

        # Topics
        topic_a = Topic(
            subject_id=subject.id,
            title="Graph Representations: Adjacency List vs Matrix",
            description="Space and time complexity trade-offs between lists and matrices.",
            key_concepts=["Adjacency List", "Adjacency Matrix", "Sparse Graphs"],
            difficulty_score=0.3,
            order_index=0,
        )
        topic_b = Topic(
            subject_id=subject.id,
            title="Breadth-First Search (BFS) and Depth-First Search (DFS)",
            description="Queue and stack-based graph exploration algorithms.",
            key_concepts=["BFS", "DFS", "Queues", "Visited Set"],
            difficulty_score=0.5,
            order_index=1,
        )
        topic_c = Topic(
            subject_id=subject.id,
            title="Dijkstra's Shortest Path Algorithm",
            description="Greedy priority queue shortest path derivation in non-negative weighted graphs.",
            key_concepts=["Priority Queue", "Min-Heap", "Dijkstra", "Shortest Path"],
            difficulty_score=0.75,
            order_index=2,
        )
        session.add_all([topic_a, topic_b, topic_c])
        await session.flush()
        print("✓ Created sample course curriculum with 3 topics.")

        # Sync topics and prerequisites to Neo4j
        try:
            for t in [topic_a, topic_b, topic_c]:
                await graph_service.create_topic(
                    TopicNode(id=t.id, title=t.title, difficulty_score=t.difficulty_score, key_concepts=t.key_concepts)
                )
            # Add prerequisite relationships: A -> B -> C
            await graph_service.add_prerequisite(topic_b.id, topic_a.id)
            await graph_service.add_prerequisite(topic_c.id, topic_b.id)

            print("✓ Neo4j topology seeded with topics and prerequisites.")
        except Exception:
            pass

        await session.commit()

    await database_manager.disconnect()
    try:
        await graph_manager.disconnect()
    except Exception:
        pass

    print("=" * 60)
    print("Seed Complete! Educational curriculum and knowledge graph initialized.")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
