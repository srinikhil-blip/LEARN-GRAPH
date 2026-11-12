"""
LearnGraph — UploadedFile ORM Model
Manages uploaded documents (PDF, DOCX, PPTX, images), OCR text, and extracted concepts.
"""

import uuid
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import FileType, ProcessingStatus

if TYPE_CHECKING:
    from app.models.user import User


class UploadedFile(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """
    Stores metadata and parsed content of student or teacher uploaded files.
    """

    __tablename__ = "uploaded_files"

    uploader_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    original_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    file_type: Mapped[FileType] = mapped_column(
        String(20),
        nullable=False,
    )
    mime_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    file_size_bytes: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    storage_url: Mapped[str] = mapped_column(
        String(2048),
        nullable=False,
    )
    storage_path: Mapped[str] = mapped_column(
        String(1024),
        nullable=False,
    )
    processing_status: Mapped[ProcessingStatus] = mapped_column(
        String(30),
        default=ProcessingStatus.pending,
        nullable=False,
        index=True,
    )
    extracted_text: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    extracted_concepts: Mapped[Optional[List[str]]] = mapped_column(
        ARRAY(String),
        nullable=True,
    )
    extracted_keywords: Mapped[Optional[List[str]]] = mapped_column(
        ARRAY(String),
        nullable=True,
    )
    page_count: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )
    error_message: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    # Relationship
    uploader: Mapped["User"] = relationship("User", back_populates="uploaded_files")

    def __repr__(self) -> str:
        return f"<UploadedFile(id={self.id}, name='{self.filename}', status='{self.processing_status}')>"
