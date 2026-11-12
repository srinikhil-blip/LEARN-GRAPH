from __future__ import annotations

from typing import Optional

import aioredis

from app.config import settings

_redis: Optional[aioredis.Redis] = None


async def get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        _redis = await aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )
    return _redis


async def close_redis() -> None:
    global _redis
    if _redis is not None:
        await _redis.close()
        _redis = None


async def blacklist_token(jti: str, expire_seconds: int) -> None:
    """Add an access token's JTI to the Redis blacklist."""
    redis = await get_redis()
    await redis.setex(f"blacklist:{jti}", expire_seconds, "1")


async def is_token_blacklisted(jti: str) -> bool:
    """Return True if the access token JTI has been blacklisted."""
    redis = await get_redis()
    result = await redis.get(f"blacklist:{jti}")
    return result is not None


async def increment_rate_limit(key: str, window_seconds: int = 60) -> int:
    """Increment a rate-limit counter. Returns the new count."""
    redis = await get_redis()
    pipe = redis.pipeline()
    pipe.incr(key)
    pipe.expire(key, window_seconds)
    results = await pipe.execute()
    return results[0]


async def get_rate_limit_count(key: str) -> int:
    redis = await get_redis()
    val = await redis.get(key)
    return int(val) if val else 0
