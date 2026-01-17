# COMPLY.AI Backend

FastAPI backend for RGPD compliance analysis using AI agents and Featherless.ai LLM API.

## Overview

COMPLY.AI analyzes privacy policies and codebases to identify RGPD (GDPR) compliance issues across three key areas:
- **Consent Management**: Validates consent mechanisms and user rights
- **Security Practices**: Checks data protection and security measures
- **Data Lifecycle**: Analyzes retention, deletion, and portability policies

## Quick Start

### Prerequisites

- Python 3.9+
- Featherless.ai API key ([get one here](https://featherless.ai))

### Local Development

1. **Clone and navigate to backend**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment**
```bash
cp .env.example .env
# Edit .env and add your FEATHERLESS_API_KEY
```

5. **Run the server**
```bash
python main.py
# Or with uvicorn:
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

6. **Test the API**
```bash
# Health check
curl http://localhost:8000/health

# Analyze privacy policy
curl -X POST http://localhost:8000/analyze \
  -F "privacy_policy=@demo_materials/bad_privacy_policy.txt" \
  -F "repo_url=https://github.com/example/repo"
```

## API Endpoints

### GET /health
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "service": "COMPLY.AI Backend"
}
```

### POST /analyze
Analyze RGPD compliance

**Parameters:**
- `privacy_policy` (file): Privacy policy document (PDF or TXT)
- `repo_url` (string, optional): GitHub repository URL for code analysis

**Response:**
```json
{
  "status": "success",
  "filename": "privacy_policy.pdf",
  "repo_url": "https://github.com/example/repo",
  "results": {
    "consent": {
      "score": 75,
      "issues": ["..."],
      "recommendations": ["..."]
    },
    "security": {
      "score": 60,
      "issues": ["..."],
      "recommendations": ["..."]
    },
    "lifecycle": {
      "score": 80,
      "issues": ["..."],
      "recommendations": ["..."]
    }
  },
  "overall_score": 72
}
```

## Project Structure

```
backend/
├── main.py                 # FastAPI application
├── agents/                 # Analysis agents
│   ├── __init__.py
│   ├── consent.py         # Consent analysis
│   ├── security.py        # Security analysis
│   └── lifecycle.py       # Data lifecycle analysis
├── utils/                  # Utility modules
│   ├── pdf_parser.py      # PDF text extraction
│   └── llm_client.py      # Featherless.ai API client
├── data/
│   └── rgpd_rules.json    # RGPD compliance rules
├── prompts/               # LLM prompts
│   ├── consent_prompt.txt
│   ├── security_prompt.txt
│   └── lifecycle_prompt.txt
├── demo_materials/        # Test files
│   ├── bad_privacy_policy.txt
│   ├── bad_code_example.py
│   └── README.md
├── requirements.txt       # Python dependencies
├── .env.example          # Environment template
└── .gitignore           # Git ignore rules
```

## Deployment to Render

### Option 1: Web Service

1. **Create new Web Service** on [Render Dashboard](https://dashboard.render.com/)

2. **Configure service:**
   - **Build Command:** `cd backend && pip install -r requirements.txt`
   - **Start Command:** `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment:** Python 3

3. **Add environment variables:**
   - `FEATHERLESS_API_KEY`: Your API key

4. **Deploy:** Render will automatically deploy on every push to main branch

### Option 2: Deploy via render.yaml

Create `render.yaml` in repository root:

```yaml
services:
  - type: web
    name: comply-ai-backend
    env: python
    region: frankfurt
    buildCommand: cd backend && pip install -r requirements.txt
    startCommand: cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: FEATHERLESS_API_KEY
        sync: false
```

Then connect your GitHub repo to Render.

### Health Check

Configure Render health check:
- **Path:** `/health`
- **Expected Status:** 200

## Development

### Adding New Rules

Edit [data/rgpd_rules.json](data/rgpd_rules.json) to add compliance rules:

```json
{
  "consent_rules": [
    {
      "rule_id": "consent_004",
      "description": "New rule description",
      "severity": "high",
      "keywords": ["keyword1", "keyword2"]
    }
  ]
}
```

### Customizing Prompts

Modify prompt files in [prompts/](prompts/) directory to adjust LLM analysis behavior.

### Testing with Demo Materials

Use the provided bad examples to test detection:

```bash
curl -X POST http://localhost:8000/analyze \
  -F "privacy_policy=@demo_materials/bad_privacy_policy.txt"
```

## Tech Stack

- **FastAPI**: Modern Python web framework
- **Featherless.ai**: LLM API for compliance analysis
- **PyPDF2**: PDF text extraction
- **httpx**: Async HTTP client
- **uvicorn**: ASGI server

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `FEATHERLESS_API_KEY` | Yes | API key from Featherless.ai |
| `FEATHERLESS_MODEL` | No | Specific model to use (default: "default") |

## Contributing

This is a hackathon project. Focus areas:
1. Implement agent logic in `agents/*.py`
2. Improve LLM prompts for better detection
3. Add more RGPD rules in `data/rgpd_rules.json`
4. Enhance response parsing in `llm_client.py`

## License

MIT License - Hackathon Project
