"""
Concept extractor: pulls structured knowledge-graph nodes and edges from raw text.

ConceptExtractor wraps GPT-4o to produce strongly-typed Pydantic models
(``ConceptExtractionResult``) from arbitrary educational content. It also
handles multi-chunk document extraction with result merging.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.ai.base import BaseAIService
from app.core.exceptions import AIServiceError

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

RelationshipType = Literal[
    "prerequisite",
    "extends",
    "related_to",
    "part_of",
    "contrasts_with",
    "applied_in",
    "defined_by",
    "example_of",
]


class ExtractedConcept(BaseModel):
    """A single educational concept extracted from content."""

    name: str = Field(..., description="Short, canonical name of the concept")
    description: str = Field(..., description="One-to-two sentence description")
    importance_score: float = Field(
        ..., ge=0.0, le=1.0, description="Relative importance within the content (0–1)"
    )

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Concept name must not be blank")
        return v.strip().title()


class ConceptRelationship(BaseModel):
    """A directed or undirected relationship between two concepts."""

    concept_a: str = Field(..., description="Source concept name")
    concept_b: str = Field(..., description="Target concept name")
    relationship_type: RelationshipType = Field(
        ..., description="Semantic type of the relationship"
    )
    description: str = Field(
        default="", description="Optional explanation of the relationship"
    )


class ConceptExtractionResult(BaseModel):
    """
    Full structured extraction result for a piece of educational content.
    """

    concepts: list[ExtractedConcept] = Field(default_factory=list)
    relationships: list[ConceptRelationship] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)
    difficulty_score: float = Field(
        default=0.5, ge=0.0, le=1.0, description="Overall content difficulty (0–1)"
    )
    prerequisites: list[str] = Field(
        default_factory=list,
        description="Topics a student should know before this content",
    )
    summary: str = Field(default="", description="Two-to-four sentence summary")

    # ------------------------------------------------------------------
    # Merge helper used when combining chunk-level results
    # ------------------------------------------------------------------
    def merge(self, other: "ConceptExtractionResult") -> "ConceptExtractionResult":
        """Return a new result that combines *self* and *other*."""
        seen_concepts: set[str] = {c.name for c in self.concepts}
        merged_concepts = list(self.concepts)
        for c in other.concepts:
            if c.name not in seen_concepts:
                merged_concepts.append(c)
                seen_concepts.add(c.name)

        seen_rels: set[tuple[str, str, str]] = {
            (r.concept_a, r.concept_b, r.relationship_type) for r in self.relationships
        }
        merged_rels = list(self.relationships)
        for r in other.relationships:
            key = (r.concept_a, r.concept_b, r.relationship_type)
            if key not in seen_rels:
                merged_rels.append(r)
                seen_rels.add(key)

        merged_keywords = list(dict.fromkeys(self.keywords + other.keywords))
        merged_prerequisites = list(
            dict.fromkeys(self.prerequisites + other.prerequisites)
        )
        avg_difficulty = (self.difficulty_score + other.difficulty_score) / 2

        return ConceptExtractionResult(
            concepts=merged_concepts,
            relationships=merged_rels,
            keywords=merged_keywords[:30],
            difficulty_score=round(avg_difficulty, 3),
            prerequisites=merged_prerequisites,
            summary=self.summary or other.summary,
        )


# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = """\
You are an expert knowledge-graph builder and educational content analyst.
Your task is to analyze educational text and extract structured information
for building a comprehensive learning knowledge graph.

Always respond with VALID JSON matching exactly this schema:
{
  "concepts": [
    {
      "name": "string (canonical concept name)",
      "description": "string (1-2 sentences)",
      "importance_score": 0.0-1.0
    }
  ],
  "relationships": [
    {
      "concept_a": "string",
      "concept_b": "string",
      "relationship_type": "prerequisite|extends|related_to|part_of|contrasts_with|applied_in|defined_by|example_of",
      "description": "string (optional explanation)"
    }
  ],
  "keywords": ["string"],
  "difficulty_score": 0.0-1.0,
  "prerequisites": ["string"],
  "summary": "string (2-4 sentences)"
}

Rules:
- Extract 3-15 key concepts depending on content length.
- Include only meaningful relationships (not trivial co-occurrence).
- difficulty_score: 0.0=absolute beginner, 1.0=doctoral research.
- keywords should be searchable terms (5-20 items).
- prerequisites are topic *names*, not concept objects.
"""


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------


class ConceptExtractor(BaseAIService):
    """
    Extracts educational concepts, relationships, and metadata from text.

    Supports both single-text extraction and multi-chunk document
    extraction with result merging.
    """

    _CHUNK_SIZE: int = 3000  # characters per chunk
    _CHUNK_OVERLAP: int = 200

    async def extract_concepts(
        self,
        text: str,
        subject_area: str = "General",
    ) -> ConceptExtractionResult:
        """
        Extract knowledge-graph elements from *text*.

        Args:
            text: Raw educational content (up to ~12 k characters).
            subject_area: Broad subject to bias extraction (e.g. "Physics").

        Returns:
            Validated :class:`ConceptExtractionResult`.

        Raises:
            AIServiceError: When the LLM returns invalid JSON.
        """
        user_prompt = (
            f"Subject area: {subject_area}\n\n"
            f"Content to analyze:\n{text[:8000]}"
        )

        messages = [
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]

        raw = await self._call_openai(
            messages=messages,
            model="gpt-4o",
            max_tokens=2048,
            temperature=0.3,
            response_format={"type": "json_object"},
        )

        return self._parse_result(raw)

    async def extract_from_document(
        self,
        file_path: str,
        subject_area: str = "General",
    ) -> ConceptExtractionResult:
        """
        Extract concepts from a text file, chunked for long documents.

        Args:
            file_path: Absolute path to a ``.txt`` or ``.md`` file.
            subject_area: Broad subject domain hint.

        Returns:
            Merged :class:`ConceptExtractionResult` across all chunks.

        Raises:
            FileNotFoundError: If *file_path* does not exist.
            AIServiceError: On LLM or parse errors.
        """
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"Document not found: {file_path}")

        text = path.read_text(encoding="utf-8", errors="replace")
        chunks = self._chunk_text(text)

        logger.info(
            "Extracting concepts from document",
            extra={"file": file_path, "chunks": len(chunks)},
        )

        merged: ConceptExtractionResult | None = None
        for i, chunk in enumerate(chunks):
            logger.debug("Processing chunk %d/%d", i + 1, len(chunks))
            result = await self.extract_concepts(chunk, subject_area)
            merged = result if merged is None else merged.merge(result)

        if merged is None:
            return ConceptExtractionResult()

        # Re-generate a unified summary from the full text (first 4k chars)
        if len(chunks) > 1:
            merged.summary = await self._generate_summary(text[:4000], subject_area)

        return merged

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _chunk_text(self, text: str) -> list[str]:
        """Split *text* into overlapping chunks."""
        chunks: list[str] = []
        start = 0
        while start < len(text):
            end = start + self._CHUNK_SIZE
            chunks.append(text[start:end])
            start += self._CHUNK_SIZE - self._CHUNK_OVERLAP
        return chunks

    def _parse_result(self, raw: str) -> ConceptExtractionResult:
        """Parse and validate a JSON string into ConceptExtractionResult."""
        try:
            data = json.loads(raw)
            return ConceptExtractionResult.model_validate(data)
        except (json.JSONDecodeError, ValueError) as exc:
            logger.error("Failed to parse concept extraction result: %s", exc)
            raise AIServiceError(
                f"Concept extractor returned invalid JSON: {exc}"
            ) from exc

    async def _generate_summary(self, text: str, subject_area: str) -> str:
        """Generate a short unified summary of the full document."""
        messages = [
            {
                "role": "system",
                "content": "You are an expert educational content summarizer.",
            },
            {
                "role": "user",
                "content": (
                    f"Summarize this {subject_area} content in 2-4 sentences:\n\n{text}"
                ),
            },
        ]
        return await self._call_openai(
            messages=messages, model="gpt-4o-mini", max_tokens=256, temperature=0.3
        )
