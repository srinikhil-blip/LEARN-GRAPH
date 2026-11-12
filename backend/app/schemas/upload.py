"""
LearnGraph — Upload Schemas
Models for document upload responses and OCR/concept extraction metadata.
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict

from app.models.enums import FileType, ProcessingStatus


class UploadedFileResponse(BaseModel):
    id: UUID
    filename: str
    original_filename: str
    file_type: FileType
    file_size_bytes: int
    storage_url: str
    processing_status: ProcessingStatus
    extracted_concepts: Optional[List[str]] = []
    page_count: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
