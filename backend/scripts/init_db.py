"""
LearnGraph — Database & Neo4j Initialization Script
Creates PostgreSQL tables via SQLAlchemy and initializes Neo4j constraints/indexes.
Usage: python scripts/init_db.py
"""

import asyncio
import structlog

from app.core.config import settings
from app.core.security import hash_password
from app.database.base import Base
from app.database.session import database_manager
from app.graph.schema import initialize_schema
from app.graph.session import graph_manager
from app.models.enums import UserRole
from app.models.user import User

logger = structlog.get_logger(__name__)


async def main() -> None:
    print("=" * 60)
    print("Initializing LearnGraph Infrastructure")
    print("=" * 60)

    # 1. Connect to PostgreSQL and create all tables
    print("--> Connecting to PostgreSQL...")
    await database_manager.connect()
    async with database_manager._engine.begin() as conn:
        print("--> Generating PostgreSQL tables from SQLAlchemy metadata...")
        await conn.run_sync(Base.metadata.create_all)
    print("✓ PostgreSQL tables ready.")

    # 2. Seed default admin user if not exists
    async with database_manager.session() as session:
        from app.repositories.user_repository import UserRepository
        repo = UserRepository(session)
        admin_email = "admin@learngraph.ai"
        existing = await repo.get_by_email(admin_email)
        if not existing:
            print(f"--> Creating initial admin account: {admin_email}")
            admin_user = User(
                email=admin_email,
                hashed_password=hash_password("AdminPass123!"),
                full_name="LearnGraph Administrator",
                role=UserRole.admin,
                is_active=True,
                is_verified=True,
            )
            session.add(admin_user)
            await session.commit()
            print("✓ Default admin created.")
        else:
            print("✓ Default admin already exists.")

    # 3. Connect to Neo4j and apply schema constraints
    print("--> Initializing Neo4j schema & constraints...")
    try:
        await graph_manager.connect()
        async with graph_manager.session() as g_session:
            await initialize_schema(g_session)
        print("✓ Neo4j constraints & full-text indexes configured.")
    except Exception as e:
        print(f"⚠ Neo4j schema setup deferred (connection warning): {e}")

    await database_manager.disconnect()
    await graph_manager.disconnect()
    print("=" * 60)
    print("LearnGraph Database & Knowledge Graph Initialized Successfully!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
