import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Receipt Scanner API",
    description="Scans receipt images using PaddleOCR and extracts expense data (description, amount, category)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routers import scan  # noqa: E402

app.include_router(scan.router)


@app.on_event("startup")
async def startup():
    # Force-import ocr_service so PaddleOCR model loads at startup, not on first request
    from app.services import ocr_service  # noqa: F401
    logger.info("PaddleOCR model preloaded - ready to serve requests")


@app.get("/health")
async def health():
    return {"status": "ok"}
