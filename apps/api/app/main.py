import asyncio
import logging
import time
from contextlib import asynccontextmanager
from urllib.parse import urlsplit

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.db.session import init_db
from app.routers import incidents

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("impactos")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing ImpactOS Database Schema...")
    await init_db()
    logger.info("ImpactOS Database initialized successfully.")
    yield
    logger.info("Shutting down ImpactOS...")


app = FastAPI(
    title="ImpactOS: Decision Support System",
    description="Emergency AI decision-support system that turns messy, multi-modal crisis information into verified, explainable, actionable response plans. Tagline: From Chaos To Action.",
    version="1.0.0",
    lifespan=lifespan,
)

allowed_origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
if settings.RATE_LIMIT_REQUESTS <= 0 or settings.RATE_LIMIT_WINDOW_SECONDS <= 0:
    raise ValueError("Rate-limit requests and window settings must be positive integers.")
if any(
    origin == "*"
    or urlsplit(origin).scheme not in {"http", "https"}
    or not urlsplit(origin).netloc
    or urlsplit(origin).path
    for origin in allowed_origins
):
    raise ValueError(
        "CORS_ORIGINS must contain explicit HTTP(S) origins without paths or wildcards."
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

_rate_limit_buckets: dict[str, tuple[float, int]] = {}
_rate_limit_lock = asyncio.Lock()
_rate_limit_requests_since_cleanup = 0


@app.middleware("http")
async def rate_limit_requests(request, call_next):
    global _rate_limit_requests_since_cleanup
    now = time.monotonic()
    client_ip = request.client.host if request.client else "unknown"
    window = settings.RATE_LIMIT_WINDOW_SECONDS
    async with _rate_limit_lock:
        start, count = _rate_limit_buckets.get(client_ip, (now, 0))
        if now - start >= window:
            start, count = now, 0
        if count >= settings.RATE_LIMIT_REQUESTS:
            retry_after = max(1, int(window - (now - start)))
            return JSONResponse(
                status_code=429,
                content={"detail": "Request rate limit exceeded."},
                headers={"Retry-After": str(retry_after)},
            )
        _rate_limit_buckets[client_ip] = (start, count + 1)
        _rate_limit_requests_since_cleanup += 1
        if _rate_limit_requests_since_cleanup >= 256:
            _rate_limit_buckets.update(
                {
                    ip: bucket
                    for ip, bucket in _rate_limit_buckets.items()
                    if now - bucket[0] < window
                }
            )
            _rate_limit_requests_since_cleanup = 0
    return await call_next(request)


# Include Routers
app.include_router(incidents.router)


@app.api_route("/", methods=["GET", "HEAD"], tags=["system"])
async def root():
    return {
        "system": "ImpactOS",
        "tagline": "From Chaos To Action",
        "version": "1.0.0",
        "phase": "Phase 1: Core Pipeline + Trust",
        "status": "operational" if settings.GEMINI_API_KEY else "degraded",
        "gemini_model": settings.GEMINI_MODEL,
        "database": settings.DATABASE_URL.split("///")[0]
        if "///" in settings.DATABASE_URL
        else "postgresql",
    }


@app.api_route("/health", methods=["GET", "HEAD"], tags=["system"])
async def health_check():
    return {
        "status": "healthy",
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "active_model": settings.GEMINI_MODEL,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host=settings.API_HOST, port=settings.API_PORT, reload=True)
