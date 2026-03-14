import httpx


async def download_image(image_url: str) -> bytes:
    """Download an image from a URL (S3 presigned or public)."""
    async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
        response = await client.get(image_url)
        response.raise_for_status()
        return response.content
