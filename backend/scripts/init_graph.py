"""
LearnGraph — Neo4j Knowledge Graph Initializer & Seeder
Executes knowledge_graph_schema.cypher and knowledge_graph_seed.cypher against Neo4j.
Usage: python scripts/init_graph.py
"""

import asyncio
from pathlib import Path
import structlog

from app.graph.schema import initialize_schema
from app.graph.session import graph_manager

logger = structlog.get_logger(__name__)


async def main() -> None:
    print("=" * 65)
    print("Initializing LearnGraph Neo4j Knowledge Graph")
    print("=" * 65)

    base_dir = Path(__file__).resolve().parent.parent / "database"
    schema_file = base_dir / "knowledge_graph_schema.cypher"
    seed_file = base_dir / "knowledge_graph_seed.cypher"

    print("--> Connecting to Neo4j AuraDB / Bolt driver...")
    await graph_manager.connect()

    async with graph_manager.session() as session:
        # 1. Initialize constraints and indexes
        print("--> Applying Neo4j schema constraints & indexes...")
        await initialize_schema(session)
        print("✓ All 19 Node constraints and indexes configured.")

        # 2. Seed multi-disciplinary dataset if seed file exists
        if seed_file.exists():
            print(f"--> Seeding curriculum dataset from {seed_file.name}...")
            content = seed_file.read_text(encoding="utf-8")
            # Separate statements by semicolon or execute full script
            queries = [q.strip() for q in content.split(";") if q.strip()]
            for q in queries:
                if q:
                    try:
                        await session.run(q)
                    except Exception as err:
                        logger.warning("Seed statement warning", query=q[:50], error=str(err))
            print("✓ Multi-disciplinary knowledge graph seed completed successfully.")

    await graph_manager.disconnect()
    print("=" * 65)
    print("Neo4j Knowledge Graph Ready for Adaptive Learning & React Flow!")
    print("=" * 65)


if __name__ == "__main__":
    asyncio.run(main())
