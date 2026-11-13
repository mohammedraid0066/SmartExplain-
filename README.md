# SmartExplain – Document Simplifier

SmartExplain is an AI-powered web application that helps users understand complex documents by simplifying language, explaining technical terms, extracting key points, summarizing content, and answering questions about uploaded documents. It supports PDF, DOCX, and TXT files, and provides multilingual explanations.

## Features
- Document upload (PDF, DOCX, TXT)
- Text simplification
- Easy explanations
- Term identification and explanation
- Key points extraction
- Summarization
- Question and Answer
- Multilingual support
- Download simplified documents and summaries
- Original meaning preservation

## Tech Stack
- Frontend: React.js, Tailwind CSS
- Backend: Python (FastAPI)
- AI Integration: Language model API
- Database: Optional (for user history)

## Getting Started

### 1. Frontend
- Navigate to `frontend/`
- Install dependencies: `npm install`
- Start development server: `npm start`

### 2. Backend
- Navigate to `backend/`
- Create a virtual environment and activate it
- Install dependencies: `pip install -r requirements.txt`
- Start FastAPI server: `uvicorn main:app --reload`

### 3. Configuration
- Set up API keys for AI integration in backend `.env` file
- Configure backend URL in frontend if needed

### 4. Usage
- Upload a document via the dashboard
- Use the tabs to simplify, summarize, extract key points, or ask questions
- Download results as needed

## License
MIT
