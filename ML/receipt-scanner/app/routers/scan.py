import logging

import httpx
from fastapi import APIRouter

from app.schemas.receipt import ReceiptData, ScanReceiptRequest, ScanReceiptResponse
from app.services.downloader import download_image
from app.services.ocr_service import parse_receipt

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["receipt"])


@router.post("/scan-receipt", response_model=ScanReceiptResponse)
async def scan_receipt(request: ScanReceiptRequest):
    try:
        # Step 1: Download image from S3 / public URL
        image_bytes = await download_image(request.image_url)

        # Step 2: Run PaddleOCR + extract fields
        result = parse_receipt(image_bytes)

        return ScanReceiptResponse(
            success=True,
            data=ReceiptData(
                description=result["description"],
                amount=result["amount"],
                category=result["category"],
            ),
            raw_ocr_text=result["raw_ocr_text"],
        )

    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error downloading image: {e}")
        return ScanReceiptResponse(
            success=False,
            error=f"Failed to download image: HTTP {e.response.status_code}",
        )
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return ScanReceiptResponse(
            success=False,
            error=f"An error occurred: {str(e)}",
        )
