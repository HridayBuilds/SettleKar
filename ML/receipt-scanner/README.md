# Receipt Scanner API

A FastAPI-based receipt scanning service that extracts expense data from receipt images using **PaddleOCR** (a pre-trained deep learning OCR model by Baidu). No API keys required - everything runs locally.

## What It Does

Takes a receipt image URL (Amazon S3 or any public URL) and returns structured expense data for auto-filling the "Add New Expense" form:

| Field | How It's Extracted |
|-------|-------------------|
| `description` | Store/vendor name from the receipt (first meaningful text line) |
| `amount` | Total amount parsed via regex patterns (matches "Total", "Grand Total", "Amount Due", etc.) |
| `category` | Classified into one of: `food`, `transport`, `accommodation`, `entertainment`, `utilities`, `shopping`, `health`, `education`, `other` |
| `paid_by` | NOT extracted from receipt - should be set by backend from the authenticated user's session |

---

## Is It Hardcoded or ML-Based?

**The system uses a hybrid approach - ML model for OCR + rule-based logic for field extraction:**

### 1. Text Extraction - PRE-TRAINED ML MODEL (PaddleOCR)

PaddleOCR is a **pre-trained deep learning model** developed by Baidu's PaddlePaddle framework. It is NOT hardcoded. It uses three neural networks under the hood:

| Model | Purpose | Architecture |
|-------|---------|-------------|
| **Text Detection (DB)** | Finds where text is located in the image | Differentiable Binarization neural network |
| **Text Recognition (CRNN)** | Reads the detected text regions into characters | Convolutional Recurrent Neural Network |
| **Angle Classifier** | Detects if text is rotated (disabled for speed) | CNN classifier |

These models were trained on millions of text images and can read text from any receipt, invoice, or document with ~90-96% accuracy. They are **not hardcoded** - they genuinely "see" and interpret text from images using deep learning.

### 2. Amount Extraction - REGEX PATTERNS (Rule-Based)

The amount is extracted using **regex patterns** that look for common receipt keywords:

```
"grand total", "total amount", "net total", "total", "amount due/paid/payable"
```

This IS pattern-based (not ML), but it is NOT hardcoded to specific values. It works on any receipt that uses standard total/amount labels. Fallback: picks the largest decimal number on the receipt.

### 3. Category Classification - KEYWORD MATCHING (Rule-Based)

Category is determined by **keyword scoring** - the OCR text is scanned for known brand names and industry terms:

- `"pizza"`, `"starbucks"`, `"grocery"` -> `food`
- `"uber"`, `"petrol"`, `"flight"` -> `transport`
- `"hotel"`, `"airbnb"`, `"oyo"` -> `accommodation`
- etc.

The category with the most keyword matches wins. If nothing matches, it defaults to `"other"`. This is rule-based but covers 100+ keywords across 8 categories.

### Summary

```
Image  -->  [PaddleOCR ML Model]  -->  Raw Text  -->  [Regex + Keywords]  -->  Structured Data
             (Deep Learning)                          (Rule-Based)
```

---

## Project Structure

```
receipt-scanner/
├── requirements.txt                           # Python dependencies
├── app/
│   ├── main.py                                # FastAPI app entry + CORS + model preloading
│   ├── routers/
│   │   └── scan.py                            # POST /api/scan-receipt endpoint
│   ├── schemas/
│   │   └── receipt.py                         # Pydantic request/response models
│   └── services/
│       ├── ocr_service.py                     # PaddleOCR + amount/description/category extraction
│       └── downloader.py                      # Downloads image from URL/S3
└── notebook/
    └── receipt_scanner_prototype.ipynb         # Jupyter notebook prototype for testing
```

---

## How the Pipeline Works

```
1. Backend sends POST /api/scan-receipt with { "image_url": "https://s3-bucket/receipt.jpg" }
           |
2. downloader.py downloads the image bytes from the URL
           |
3. ocr_service.py:
   a. Resizes image to max 1000px (for speed)
   b. Runs PaddleOCR to extract all text from the image
   c. extract_amount()       -> finds total using regex patterns
   d. extract_description()  -> picks store name from first lines
   e. classify_category()    -> scores text against 100+ keywords
           |
4. Returns JSON response with { description, amount, category, raw_ocr_text }
```

---

## API Reference

### `GET /health`

Health check endpoint.

**Response:**
```json
{ "status": "ok" }
```

### `POST /api/scan-receipt`

Scan a receipt image and extract expense data.

**Request:**
```json
{
  "image_url": "https://your-s3-bucket.amazonaws.com/receipt.jpg"
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "description": "Walmart",
    "amount": 98.21,
    "category": "food"
  },
  "raw_ocr_text": "Walmart\nSave money. Live better.\n...\nTOTAL 98.21\n...",
  "error": null
}
```

**Error Response:**
```json
{
  "success": false,
  "data": null,
  "raw_ocr_text": null,
  "error": "Failed to download image: HTTP 404"
}
```

### `GET /docs`

Interactive Swagger UI for testing the API in your browser.

---

## Setup & Run

### 1. Install Dependencies

```bash
cd receipt-scanner
pip install -r requirements.txt
```

### 2. Start the Server

```bash
uvicorn app.main:app --reload --port 8000
```

The server will:
- Preload the PaddleOCR model at startup (~10-15s first time, downloads model weights)
- After startup, each request takes ~2-5 seconds

### 3. Test the Endpoint

```bash
curl -X POST http://127.0.0.1:8000/api/scan-receipt -H "Content-Type: application/json" -d "{\"image_url\": \"https://ocr.space/Content/Images/receipt-ocr-original.webp\"}"
```

Or open `http://127.0.0.1:8000/docs` in your browser for interactive testing.

---

## Performance Optimizations

| Optimization | Effect |
|-------------|--------|
| Model preloaded at server startup | No cold-start delay on first request |
| Angle classifier disabled | ~30-40% faster (receipts are usually upright) |
| Images resized to max 1000px | ~2-3x faster on large/high-res images |
| Singleton OCR instance | Model loaded once, reused across all requests |

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `fastapi` | Web framework for the API |
| `uvicorn` | ASGI server to run FastAPI |
| `paddlepaddle` | PaddlePaddle deep learning framework (required by PaddleOCR) |
| `paddleocr` | OCR engine with pre-trained text detection + recognition models |
| `httpx` | Async HTTP client for downloading images from URLs |
| `Pillow` | Image processing (resize, format conversion) |
| `numpy` | Array operations for image data |
| `pydantic` | Data validation for request/response models |
