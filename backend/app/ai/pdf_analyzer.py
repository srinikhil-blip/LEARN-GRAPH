"""
LearnGraph — Document & PDF Processing Service
Extracts text from PDF/DOCX/PPTX, performs OCR when needed, and produces structured document analyses.
"""

from pathlib import Path
from typing import Any, Dict, List
import structlog

logger = structlog.get_logger(__name__)


class PDFAnalyzer:
    """Handles text extraction and structure parsing from uploaded educational documents."""

    @staticmethod
    def extract_text(file_path: str) -> str:
        """Extract all textual content from a PDF document using PyMuPDF (fitz)."""
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        try:
            import fitz  # PyMuPDF

            doc = fitz.open(file_path)
            extracted = []
            for page in doc:
                text = page.get_text()
                if text.strip():
                    extracted.append(text)
            doc.close()

            # If empty text extracted, attempt fallback OCR
            full_text = "\n\n".join(extracted)
            if not full_text.strip():
                full_text = PDFAnalyzer._ocr_fallback(file_path)
            return full_text
        except Exception as e:
            logger.warning("PyMuPDF extraction failed, attempting fallback", error=str(e))
            return PDFAnalyzer._ocr_fallback(file_path)

    @staticmethod
    def _ocr_fallback(file_path: str) -> str:
        """Perform Tesseract OCR if text layer is missing or scanned."""
        try:
            import fitz
            from PIL import Image
            import pytesseract

            doc = fitz.open(file_path)
            pages_text = []
            for page in doc:
                pix = page.get_pixmap()
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                ocr_text = pytesseract.image_to_string(img)
                if ocr_text.strip():
                    pages_text.append(ocr_text)
            doc.close()
            return "\n\n".join(pages_text)
        except Exception as err:
            logger.error("OCR fallback failed or Tesseract not installed", error=str(err))
            return "Text extraction unavailable for this file."
