"""
LearnGraph — Async Redis Connection Manager
Singleton wrapper around redis.asyncio providing typed async helpers.
"""

from typing import Any, Optional, Union

import structlog
from redis.asyncio import Redis
from redis.asyncio import from_url as redis_from_url
from redis.exceptions import RedisError

from app.core.config import settings

logger = structlog.get_logger(__name__)


class RedisManager:
    """
    Manages a single async Redis connection pool for the application lifecycle.

    Usage:
        await redis_manager.connect()          # on startup
        client = redis_manager.get_client()    # get the Redis instance
        await redis_manager.disconnect()       # on shutdown
    """

    def __init__(self) -> None:
        self._client: Optional[Redis] = None

    # ── Lifecycle ─────────────────────────────────────────────────────────────

    async def connect(self) -> None:
        """
        Initialise the Redis connection pool.
        Called once during application startup.
        """
        try:
            self._client = await redis_from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                max_connections=20,
            )
            # Ping to verify connectivity
            await self._client.ping()
            logger.info("Redis connection established", url=settings.REDIS_URL)
        except Exception as exc:
            self._client = None
            logger.error("Redis connection failed", error=str(exc))
            raise

    async def disconnect(self) -> None:
        """
        Close the Redis connection pool.
        Called once during application shutdown.
        """
        if self._client is not None:
            await self._client.aclose()
            self._client = None
            logger.info("Redis connection closed")

    def get_client(self) -> Redis:
        """
        Return the active Redis client.

        Raises:
            RuntimeError: If called before :meth:`connect`.
        """
        if self._client is None:
            raise RuntimeError(
                "RedisManager is not connected. Call connect() during startup."
            )
        return self._client

    # ── Typed Async Helpers ───────────────────────────────────────────────────

    async def get(self, key: str) -> Optional[str]:
        """
        Retrieve a string value by key.

        Args:
            key: Redis key to look up.

        Returns:
            Decoded string value, or None if the key does not exist.
        """
        try:
            return await self.get_client().get(key)
        except RedisError as exc:
            logger.error("Redis GET failed", key=key, error=str(exc))
            raise

    async def set(
        self,
        key: str,
        value: Union[str, int, float],
        *,
        ex: Optional[int] = None,
        nx: bool = False,
    ) -> bool:
        """
        Set a key to a value with optional expiry and NX semantics.

        Args:
            key: Redis key.
            value: Value to store (coerced to string internally by redis-py).
            ex: Expiry in seconds (optional).
            nx: If True, only set when the key does not already exist.

        Returns:
            True if the key was set, False if nx=True and key existed.
        """
        try:
            result = await self.get_client().set(key, value, ex=ex, nx=nx)
            return bool(result)
        except RedisError as exc:
            logger.error("Redis SET failed", key=key, error=str(exc))
            raise

    async def setex(self, key: str, ttl_seconds: int, value: Union[str, int, float]) -> None:
        """
        Set a key with a mandatory TTL.

        Args:
            key: Redis key.
            ttl_seconds: Time-to-live in seconds (must be > 0).
            value: Value to store.
        """
        try:
            await self.get_client().setex(key, ttl_seconds, value)
        except RedisError as exc:
            logger.error("Redis SETEX failed", key=key, ttl=ttl_seconds, error=str(exc))
            raise

    async def delete(self, *keys: str) -> int:
        """
        Delete one or more keys.

        Returns:
            Number of keys that were deleted.
        """
        try:
            return await self.get_client().delete(*keys)
        except RedisError as exc:
            logger.error("Redis DELETE failed", keys=keys, error=str(exc))
            raise

    async def exists(self, *keys: str) -> int:
        """
        Check how many of the given keys exist.

        Returns:
            Count of existing keys.
        """
        try:
            return await self.get_client().exists(*keys)
        except RedisError as exc:
            logger.error("Redis EXISTS failed", keys=keys, error=str(exc))
            raise

    async def expire(self, key: str, ttl_seconds: int) -> bool:
        """
        Set a TTL on an existing key.

        Returns:
            True if the TTL was set, False if the key does not exist.
        """
        try:
            return await self.get_client().expire(key, ttl_seconds)
        except RedisError as exc:
            logger.error("Redis EXPIRE failed", key=key, ttl=ttl_seconds, error=str(exc))
            raise

    async def incr(self, key: str, amount: int = 1) -> int:
        """
        Atomically increment a counter key.

        Args:
            key: Redis key to increment.
            amount: Increment step (default 1).

        Returns:
            New integer value after increment.
        """
        try:
            return await self.get_client().incr(key, amount)
        except RedisError as exc:
            logger.error("Redis INCR failed", key=key, amount=amount, error=str(exc))
            raise

    async def ttl(self, key: str) -> int:
        """
        Return the remaining TTL of a key in seconds.

        Returns:
            Remaining TTL, -1 if no expiry, -2 if key does not exist.
        """
        try:
            return await self.get_client().ttl(key)
        except RedisError as exc:
            logger.error("Redis TTL failed", key=key, error=str(exc))
            raise


# ── Global Singleton ──────────────────────────────────────────────────────────

redis_manager = RedisManager()
