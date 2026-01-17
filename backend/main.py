from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="COMPLY.AI - RGPD Compliance Scanner")

# CORS configuration - allow all origins for hackathon
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "COMPLY.AI Backend"}


@app.post("/analyze")
async def analyze_compliance(
    privacy_policy: UploadFile = File(...), repo_url: Optional[str] = Form(None)
):
    """
    Analyze RGPD compliance from privacy policy and optional repository URL

    Returns compliance scores for:
    - Consent management
    - Security practices
    - Data lifecycle
    """

    # TODO: Implement analysis logic using agents
    # For now, return mock response structure

    return {
        "status": "success",
        "filename": privacy_policy.filename,
        "repo_url": repo_url,
        "results": {
            "consent": {"score": 0, "issues": [], "recommendations": []},
            "security": {"score": 0, "issues": [], "recommendations": []},
            "lifecycle": {"score": 0, "issues": [], "recommendations": []},
        },
        "overall_score": 0,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
