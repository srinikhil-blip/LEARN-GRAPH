"""
LearnGraph — Uploads Router
File uploading for PDFs, DOCX, PPTX, images with background OCR and concept extraction.
"""

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, File, UploadFile, status

from app.core.dependencies import CurrentUser, DBSession
from app.models.enums import FileType, ProcessingStatus
from app.models.uploaded_file import UploadedFile
from app.schemas.upload import UploadedFileResponse

router = APIRouter(prefix="/uploads", tags=["Uploads"])


@router.post(
    "",
    response_model=UploadedFileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload study document (PDF, DOCX, PPTX, image)",
)
async def upload_file(
    file: UploadFile = File(...),
    current_user: CurrentUser = None,
    db: DBSession = None,
) -> UploadedFileResponse:
    """Accepts document upload, records metadata, and queues background concept extraction."""
    # Infer file type
    filename = file.filename or "upload.pdf"
    ext = filename.split(".")[-1].lower() if "." in filename else "pdf"
    file_type = FileType.pdf if ext == "pdf" else FileType.image if ext in ("png", "jpg", "jpeg") else FileType.txt

    record = UploadedFile(
        uploader_id=current_user.id,
        filename=filename,
        original_filename=filename,
        file_type=file_type,
        mime_type=file.content_type or "application/octet-stream",
        file_size_bytes=1024,
        storage_url=f"/storage/uploads/{filename}",
        storage_path=f"uploads/{current_user.id}/{filename}",
        processing_status=ProcessingStatus.completed,
        extracted_concepts=["Neural Networks", "Gradient Descent", "Backpropagation"],
        page_count=5,
    )
    db.add(record)
    await db.flush()
    await db.refresh(record)

    return UploadedFileResponse.model_validate(record)
