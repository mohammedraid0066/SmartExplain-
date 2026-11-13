# SmartExplain Backend

This is the FastAPI backend for SmartExplain – Document Simplifier.

## Setup

1. Create a virtual environment:
   python -m venv venv
   
2. Activate the environment:
   - Windows: venv\Scripts\activate
   - macOS/Linux: source venv/bin/activate

3. Install dependencies:
   pip install -r requirements.txt

4. Run the server:
   uvicorn main:app --reload

## Endpoints
- `/upload` – Upload document (PDF, DOCX, TXT)
- `/simplify` – Simplify text
- `/summarize` – Summarize text
- `/keypoints` – Extract key points
- `/explain_terms` – Explain technical terms
- `/qa` – Question and Answer
- `/download` – Download processed files
