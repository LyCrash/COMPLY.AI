from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import os
from dotenv import load_dotenv
import shutil
from git import Repo
from pathlib import Path

load_dotenv()

# Directory to store cloned repositories
REPOS_DIR = Path("./cloned_repos")
REPOS_DIR.mkdir(exist_ok=True)

app = FastAPI(title="COMPLY.AI - RGPD Compliance Scanner")

# CORS configuration - allow all origins for hackathon
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def clone_github_repo(repo_url: str) -> str:
    """
    Clone a GitHub repository and return the local path.
    
    Args:
        repo_url: Full GitHub repository URL
        
    Returns:
        Local path where repository is cloned
        
    Raises:
        HTTPException: If cloning fails
    """
    try:
        # Extract repo name from URL
        repo_name = repo_url.rstrip("/").split("/")[-1].replace(".git", "")
        repo_path = REPOS_DIR / repo_name
        
        # Remove existing directory if present
        if repo_path.exists():
            shutil.rmtree(repo_path)
        
        # Clone the repository
        Repo.clone_from(repo_url, repo_path)
        return str(repo_path)
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to clone repository: {str(e)}")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "COMPLY.AI Backend"}


@app.post("/clone-repo")
async def clone_repo(repo_url: str):
    """
    Clone a GitHub repository.
    
    Args:
        repo_url: Full GitHub repository URL (e.g., https://github.com/user/repo.git)
        
    Returns:
        Local path where repository is cloned
    """
    repo_path = clone_github_repo(repo_url)
    return {
        "status": "success",
        "repo_url": repo_url,
        "local_path": repo_path,
        "message": "Repository cloned successfully"
    }


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
