from pydantic import BaseModel
from typing import Optional


class ScanReceiptRequest(BaseModel):
    image_url: str  # S3 presigned URL or any public image URL


class ReceiptData(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None  # food, transport, accommodation, entertainment, utilities, shopping, health, education, other


class ScanReceiptResponse(BaseModel):
    success: bool
    data: Optional[ReceiptData] = None
    raw_ocr_text: Optional[str] = None
    error: Optional[str] = None
