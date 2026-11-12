"""
LearnGraph — Neo4j Connection Manager
Async driver management with session context manager and query helpers.
"""

from contextlib import asynccontextmanager
from typing import Any, AsyncGenerator

import structlog
from neo4j import AsyncGraphDatabase, AsyncDriver, AsyncSession, Record

from app.core.config import settings
from app.core.exceptions import GraphError

logger = structlog.get_logger(__name__)


class GraphManager:
    """
    Manages the Neo4j async driver lifecycle and provides query execution helpers.

    Implements a singleton-style manager that holds a single AsyncDriver for the
    entire application lifetime. All query helpers use the configured database
    from settings and log every operation via structlog.
    """

    def __init__(self) -> None:
        self._driver: AsyncDriver | None = None

    # ── Lifecycle ────────────────────────────────────────────────────────────

    async def connect(self) -> None:
        """
        Initialise the Neo4j async driver.

        Called once at application startup. Verifies connectivity immediately
        so misconfigured credentials are caught early.
        """
        if self._driver is not None:
            logger.warning("graph_manager.connect called but driver already initialised")
            return

        logger.info(
            "graph_manager.connecting",
            uri=settings.NEO4J_URI,
            database=settings.NEO4J_DATABASE,
        )
        self._driver = AsyncGraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD),
        )
        # Verify connectivity; log a warning but do NOT raise if Neo4j is unavailable
        try:
            await self._driver.verify_connectivity()
            logger.info("graph_manager.connected")
        except Exception as exc:
            logger.warning(
                "graph_manager.connect: Neo4j unavailable at startup (continuing anyway)",
                error=str(exc),
            )

    async def disconnect(self) -> None:
        """
        Close the Neo4j driver and release all connections.

        Called once at application shutdown. Safe to call even if the driver was
        never connected.
        """
        if self._driver is None:
            return
        logger.info("graph_manager.disconnecting")
        await self._driver.close()
        self._driver = None
        logger.info("graph_manager.disconnected")

    # ── Session Context Manager ───────────────────────────────────────────────

    @asynccontextmanager
    async def session(self) -> AsyncGenerator[AsyncSession, None]:
        """
        Yield an AsyncSession scoped to the configured Neo4j database.

        Usage::

            async with graph_manager.session() as s:
                result = await s.run("RETURN 1 AS n")
        """
        if self._driver is None:
            raise GraphError("Neo4j driver is not initialised — call connect() first")

        async with self._driver.session(database=settings.NEO4J_DATABASE) as neo4j_session:
            yield neo4j_session

    # ── Query Helpers ─────────────────────────────────────────────────────────

    async def execute_query(
        self,
        cypher: str,
        params: dict[str, Any] | None = None,
    ) -> list[Record]:
        """
        Execute a read Cypher query and return all matching records.

        Args:
            cypher: The Cypher query string.
            params: Optional dictionary of query parameters.

        Returns:
            A list of :class:`neo4j.Record` objects. Returns an empty list when
            there are no results.

        Raises:
            GraphError: Wraps any Neo4j driver exception.
        """
        params = params or {}
        logger.debug("graph_manager.execute_query", cypher=cypher, params=params)
        try:
            async with self.session() as s:
                result = await s.run(cypher, parameters=params)
                records = [record async for record in result]
                return records
        except GraphError:
            raise
        except Exception as exc:
            logger.error("graph_manager.execute_query.error", error=str(exc))
            raise GraphError(f"Query execution failed: {exc}") from exc

    async def execute_write(
        self,
        cypher: str,
        params: dict[str, Any] | None = None,
    ) -> None:
        """
        Execute a write Cypher statement within an explicit write transaction.

        Args:
            cypher: The Cypher write statement.
            params: Optional dictionary of query parameters.

        Raises:
            GraphError: Wraps any Neo4j driver exception.
        """
        params = params or {}
        logger.debug("graph_manager.execute_write", cypher=cypher, params=params)
        try:
            async with self.session() as s:
                async with await s.begin_transaction() as tx:
                    await tx.run(cypher, parameters=params)
                    await tx.commit()
        except GraphError:
            raise
        except Exception as exc:
            logger.error("graph_manager.execute_write.error", error=str(exc))
            raise GraphError(f"Write execution failed: {exc}") from exc


# ── Global Singleton ──────────────────────────────────────────────────────────

graph_manager = GraphManager()
