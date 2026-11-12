"""
Base AI service providing shared OpenAI, Gemini, and embedding utilities.

All AI service classes inherit from BaseAIService to gain access to
retry-decorated LLM calls, token logging, and embedding generation.
"""

from __future__ import annotations

import logging
from abc import ABC
from typing import Any

import google.generativeai as genai
import openai
from tenacity import (
    AsyncRetrying,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from app.core.config import settings
from app.core.exceptions import AIServiceError, QuotaExceededError

logger = logging.getLogger(__name__)


class BaseAIService(ABC):
    """
    Abstract base class for all AI services in LearnGraph.

    Provides shared functionality for:
    - OpenAI GPT calls with exponential-backoff retry
    - Google Gemini calls with retry
    - OpenAI text-embedding-3-small vector generation
    - Structured logging of token usage
    """

    def __init__(self) -> None:
        self._openai_client: openai.AsyncOpenAI = openai.AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY,
            timeout=60.0,
            max_retries=0,  # We handle retries manually via tenacity
        )

        genai.configure(api_key=settings.GEMINI_API_KEY)
        self._gemini_model_name: str = getattr(
            settings, "GEMINI_MODEL", "gemini-1.5-flash"
        )
        self._gemini_client: genai.GenerativeModel = genai.GenerativeModel(
            self._gemini_model_name
        )

    # ------------------------------------------------------------------
    # OpenAI helpers
    # ------------------------------------------------------------------

    async def _call_openai(
        self,
        messages: list[dict[str, str]],
        model: str = "gpt-4o",
        max_tokens: int = 2048,
        temperature: float = 0.7,
        response_format: dict[str, str] | None = None,
    ) -> str:
        """
        Call the OpenAI Chat Completions API with automatic retry.

        Retries up to 3 times on transient errors with exponential
        back-off (2 s → 4 s → 8 s).

        Args:
            messages: List of role/content message dicts.
            model: OpenAI model identifier (default ``gpt-4o``).
            max_tokens: Maximum tokens in the completion.
            temperature: Sampling temperature.
            response_format: Optional ``{"type": "json_object"}`` dict.

        Returns:
            The model's text response.

        Raises:
            QuotaExceededError: When the API rate-limit/quota is hit.
            AIServiceError: On other OpenAI API errors.
        """
        kwargs: dict[str, Any] = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
        if response_format:
            kwargs["response_format"] = response_format

        try:
            async for attempt in AsyncRetrying(
                retry=retry_if_exception_type(openai.APIConnectionError),
                stop=stop_after_attempt(3),
                wait=wait_exponential(multiplier=1, min=2, max=8),
                reraise=True,
            ):
                with attempt:
                    response = await self._openai_client.chat.completions.create(
                        **kwargs
                    )

            usage = response.usage
            if usage:
                logger.info(
                    "OpenAI token usage",
                    extra={
                        "model": model,
                        "prompt_tokens": usage.prompt_tokens,
                        "completion_tokens": usage.completion_tokens,
                        "total_tokens": usage.total_tokens,
                    },
                )

            content = response.choices[0].message.content
            if content is None:
                raise AIServiceError("OpenAI returned an empty response")
            return content

        except openai.RateLimitError as exc:
            logger.error("OpenAI rate limit / quota exceeded: %s", exc)
            raise QuotaExceededError(
                "OpenAI API quota exceeded. Please try again later."
            ) from exc
        except openai.APIError as exc:
            logger.error("OpenAI API error: %s", exc)
            raise AIServiceError(f"OpenAI API error: {exc}") from exc

    # ------------------------------------------------------------------
    # Gemini helpers
    # ------------------------------------------------------------------

    async def _call_gemini(
        self,
        prompt: str,
        model: str | None = None,
        temperature: float = 0.7,
    ) -> str:
        """
        Call the Google Gemini generative API with automatic retry.

        Args:
            prompt: The full prompt string.
            model: Optional override for the model name.
            temperature: Sampling temperature.

        Returns:
            The model's text response.

        Raises:
            QuotaExceededError: On resource-exhausted quota errors.
            AIServiceError: On other Gemini errors.
        """
        client = self._gemini_client
        if model and model != self._gemini_model_name:
            client = genai.GenerativeModel(model)

        generation_config = genai.types.GenerationConfig(temperature=temperature)

        try:
            async for attempt in AsyncRetrying(
                stop=stop_after_attempt(3),
                wait=wait_exponential(multiplier=1, min=2, max=8),
                reraise=True,
            ):
                with attempt:
                    response = await client.generate_content_async(
                        prompt,
                        generation_config=generation_config,
                    )

            if not response.text:
                raise AIServiceError("Gemini returned an empty response")
            return response.text

        except Exception as exc:
            exc_str = str(exc).lower()
            if "quota" in exc_str or "resource_exhausted" in exc_str:
                logger.error("Gemini quota exceeded: %s", exc)
                raise QuotaExceededError(
                    "Gemini API quota exceeded. Please try again later."
                ) from exc
            logger.error("Gemini API error: %s", exc)
            raise AIServiceError(f"Gemini API error: {exc}") from exc

    # ------------------------------------------------------------------
    # Embedding helpers
    # ------------------------------------------------------------------

    async def _get_embedding(self, text: str) -> list[float]:
        """
        Generate a 1536-dimensional embedding vector for *text*.

        Uses the ``text-embedding-3-small`` model which produces
        1 536-dimensional vectors, well-suited for semantic search and
        similarity scoring in the knowledge-graph pipeline.

        Args:
            text: The input text to embed (max ~8 191 tokens).

        Returns:
            A list of 1 536 floats representing the embedding.

        Raises:
            QuotaExceededError: On rate-limit errors.
            AIServiceError: On other embedding errors.
        """
        # Truncate overly long text to avoid exceeding token limits
        text = text.strip().replace("\n", " ")[:8000]

        try:
            async for attempt in AsyncRetrying(
                retry=retry_if_exception_type(openai.APIConnectionError),
                stop=stop_after_attempt(3),
                wait=wait_exponential(multiplier=1, min=2, max=8),
                reraise=True,
            ):
                with attempt:
                    response = await self._openai_client.embeddings.create(
                        model="text-embedding-3-small",
                        input=text,
                        encoding_format="float",
                    )

            vector: list[float] = response.data[0].embedding
            logger.debug(
                "Embedding generated",
                extra={"dimension": len(vector), "text_length": len(text)},
            )
            return vector

        except openai.RateLimitError as exc:
            raise QuotaExceededError("Embedding API quota exceeded") from exc
        except openai.APIError as exc:
            raise AIServiceError(f"Embedding API error: {exc}") from exc
