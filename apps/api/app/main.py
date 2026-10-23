import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db.session import init_db
from app.routers import incidents

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
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
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(incidents.router)

@app.get("/", tags=["system"])
async def root():
    return {
        "system": "ImpactOS",
        "tagline": "From Chaos To Action",
        "version": "1.0.0",
        "phase": "Phase 1: Core Pipeline + Trust",
        "status": "operational",
        "gemini_model": settings.GEMINI_MODEL,
        "database": settings.DATABASE_URL.split("///")[0] if "///" in settings.DATABASE_URL else "postgresql"
    }

@app.get("/health", tags=["system"])
async def health_check():
    return {
        "status": "healthy",
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "active_model": settings.GEMINI_MODEL
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.API_HOST, port=settings.API_PORT, reload=True)
