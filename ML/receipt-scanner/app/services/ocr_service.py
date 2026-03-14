import io
import re

import numpy as np
from paddleocr import PaddleOCR
from PIL import Image

# Initialize PaddleOCR once at import time (preloaded when server starts)
_ocr = PaddleOCR(
    use_angle_cls=False,
    lang="en",
    show_log=False,
    det_limit_side_len=736,
    rec_batch_num=8,
    det_db_box_thresh=0.5,
)


CATEGORY_KEYWORDS = {
    "food": [
        "restaurant", "cafe", "pizza", "burger", "coffee", "tea", "bakery",
        "dominos", "mcdonald", "starbucks", "subway", "kfc", "zomato",
        "swiggy", "food", "dine", "eat", "meal", "lunch", "dinner",
        "breakfast", "snack", "biryani", "chicken", "paneer", "noodle",
        "rice", "bread", "juice", "milk", "grocery", "supermarket",
        "bigbasket", "blinkit", "zepto", "dmart", "reliance fresh",
    ],
    "transport": [
        "uber", "ola", "lyft", "taxi", "cab", "fuel", "petrol", "diesel",
        "gas station", "parking", "toll", "metro", "bus", "train", "flight",
        "airline", "airport", "rapido", "auto", "rickshaw", "indigo",
        "irctc", "redbus",
    ],
    "accommodation": [
        "hotel", "motel", "inn", "resort", "airbnb", "oyo", "hostel",
        "lodge", "stay", "room", "check-in", "checkout", "booking",
        "trivago", "makemytrip",
    ],
    "entertainment": [
        "movie", "cinema", "theatre", "theater", "concert", "show",
        "netflix", "spotify", "game", "amusement", "park", "pvr", "inox",
        "bookmyshow", "event", "ticket",
    ],
    "utilities": [
        "electric", "electricity", "water", "gas", "internet", "wifi",
        "broadband", "phone", "mobile", "recharge", "bill", "jio",
        "airtel", "vodafone", "bsnl",
    ],
    "shopping": [
        "amazon", "flipkart", "myntra", "ajio", "mall", "store", "shop",
        "retail", "clothes", "fashion", "electronics", "appliance",
        "furniture", "ikea", "decathlon", "nike", "adidas", "puma",
        "meesho", "nykaa",
    ],
    "health": [
        "hospital", "clinic", "doctor", "pharmacy", "medical", "medicine",
        "lab", "diagnostic", "apollo", "fortis", "medplus", "netmeds",
        "pharmeasy", "1mg", "health", "dental", "eye", "optical",
    ],
    "education": [
        "school", "college", "university", "course", "tuition", "book",
        "stationery", "udemy", "coursera", "unacademy", "byjus",
        "library", "exam", "fee",
    ],
}


MAX_IMAGE_DIMENSION = 800  # Resize large images for faster OCR


def _resize_image(img: Image.Image) -> Image.Image:
    """Resize image so the longest side is at most MAX_IMAGE_DIMENSION."""
    w, h = img.size
    if max(w, h) <= MAX_IMAGE_DIMENSION:
        return img
    scale = MAX_IMAGE_DIMENSION / max(w, h)
    new_w, new_h = int(w * scale), int(h * scale)
    return img.resize((new_w, new_h), Image.LANCZOS)


def extract_text_from_image(image_input) -> str:
    """Run PaddleOCR on image bytes or file path. Returns all extracted text."""
    if isinstance(image_input, bytes):
        img = Image.open(io.BytesIO(image_input)).convert("RGB")
        img = _resize_image(img)
        img_array = np.array(img)
        result = _ocr.ocr(img_array, cls=False)
    else:
        result = _ocr.ocr(image_input, cls=False)

    lines = []
    if result and result[0]:
        for line in result[0]:
            lines.append(line[1][0])

    return "\n".join(lines)


def extract_amount(ocr_text: str) -> float | None:
    """Extract the total/grand total amount from OCR text."""
    text_lower = ocr_text.lower()
    lines = text_lower.split("\n")

    # Priority patterns: look for total/grand total lines first
    total_patterns = [
        r"grand\s*total\s*[:\-]?\s*[\$\₹\€\£]?\s*([\d,]+\.?\d*)",
        r"total\s*amount\s*[:\-]?\s*[\$\₹\€\£]?\s*([\d,]+\.?\d*)",
        r"net\s*total\s*[:\-]?\s*[\$\₹\€\£]?\s*([\d,]+\.?\d*)",
        r"total\s*[:\-]?\s*[\$\₹\€\£]?\s*([\d,]+\.?\d*)",
        r"amount\s*(?:due|paid|payable)?\s*[:\-]?\s*[\$\₹\€\£]?\s*([\d,]+\.?\d*)",
        r"[\$\₹\€\£]\s*([\d,]+\.?\d*)",
    ]

    for pattern in total_patterns:
        matches = re.findall(pattern, text_lower)
        if matches:
            # Take the last match (usually the final total)
            amount_str = matches[-1].replace(",", "")
            try:
                return float(amount_str)
            except ValueError:
                continue

    # Fallback: find largest number in the text (likely the total)
    all_numbers = re.findall(r"([\d,]+\.\d{2})", ocr_text)
    if all_numbers:
        amounts = []
        for n in all_numbers:
            try:
                amounts.append(float(n.replace(",", "")))
            except ValueError:
                pass
        if amounts:
            return max(amounts)

    return None


def extract_description(ocr_text: str) -> str:
    """Extract a description (store/vendor name) from the receipt."""
    lines = [l.strip() for l in ocr_text.split("\n") if l.strip()]
    if not lines:
        return "Receipt expense"

    # The first non-trivial line is usually the store name
    for line in lines[:5]:
        cleaned = re.sub(r"[^a-zA-Z0-9\s&\'-]", "", line).strip()
        if len(cleaned) >= 3 and not re.match(r"^\d+$", cleaned):
            return cleaned

    return lines[0][:100] if lines else "Receipt expense"


def classify_category(ocr_text: str) -> str:
    """Classify the receipt into a category based on keywords."""
    text_lower = ocr_text.lower()

    scores = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            scores[category] = score

    if scores:
        return max(scores, key=scores.get)

    return "other"


def parse_receipt(image_input) -> dict:
    """Full pipeline: OCR -> extract fields -> return structured data."""
    ocr_text = extract_text_from_image(image_input)

    amount = extract_amount(ocr_text)
    description = extract_description(ocr_text)
    category = classify_category(ocr_text)

    return {
        "description": description,
        "amount": amount,
        "category": category,
        "raw_ocr_text": ocr_text,
    }
