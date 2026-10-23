import re
import uuid
from pathlib import Path
from typing import Dict, Tuple

from fastapi import HTTPException, UploadFile, status

from app.config import settings

MAX_UPLOAD_BYTES = 10 * 1024 * 1024
ALLOWED_MIME_TYPES = {
    "image": {"image/jpeg", "image/png", "image/webp"},
    "audio": {"audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/mp4"},
    "pdf": {"application/pdf"},
}


def detect_upload_type(content: bytes) -> Tuple[str, str]:
    if content.startswith(b"\xff\xd8\xff"):
        return "image/jpeg", ".jpg"
    if content.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png", ".png"
    if content.startswith(b"RIFF") and content[8:12] == b"WAVE":
        return "audio/wav", ".wav"
    if content.startswith(b"ID3") or (
        len(content) > 1 and content[0] == 0xFF and content[1] & 0xE0 == 0xE0
    ):
        return "audio/mpeg", ".mp3"
    if len(content) >= 12 and content[4:8] == b"ftyp":
        return "audio/mp4", ".m4a"
    if content.startswith(b"%PDF-"):
        return "application/pdf", ".pdf"
    if len(content) >= 12 and content[8:12] == b"WEBP" and content[:4] == b"RIFF":
        return "image/webp", ".webp"
    raise HTTPException(
        status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
        detail="Unsupported or invalid file content.",
    )


async def save_validated_upload(upload: UploadFile, expected_kind: str) -> Dict[str, str]:
    if not upload.filename:
        raise HTTPException(status_code=400, detail="Uploaded file must have a filename.")

    declared_type = (upload.content_type or "").lower()
    if declared_type not in ALLOWED_MIME_TYPES[expected_kind]:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported {expected_kind} content type.",
        )

    content = await upload.read(MAX_UPLOAD_BYTES + 1)
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Uploaded files must be 10 MiB or smaller.")

    detected_type, extension = detect_upload_type(content)
    if detected_type not in ALLOWED_MIME_TYPES[expected_kind] or detected_type != declared_type:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Uploaded file content does not match its declared media type.",
        )

    safe_name = re.sub(r"[^A-Za-z0-9._-]", "_", Path(upload.filename).name)[:120] or "upload"
    stored_path = Path(settings.UPLOAD_DIR) / f"{uuid.uuid4().hex}{extension}"
    stored_path.write_bytes(content)
    return {
        "filename": safe_name,
        "path": str(stored_path),
        "mime_type": detected_type,
    }
