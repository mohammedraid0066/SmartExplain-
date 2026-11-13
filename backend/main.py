import io
import json
import os
import re
import urllib.error
import urllib.request

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

env_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.isfile(env_path):
    with open(env_path, encoding="utf-8") as env_file:
        for line in env_file:
            key, separator, value = line.strip().partition("=")
            if separator and key and not key.startswith("#"):
                os.environ.setdefault(key, value.strip().strip("\"'"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_UPLOAD_BYTES = 15 * 1024 * 1024
LANGUAGES = {"en": "English", "es": "Spanish", "fr": "French", "de": "German", "it": "Italian", "pt": "Portuguese"}
STOP_WORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "in", "is", "it", "of", "on", "or", "that", "the", "this", "to", "was", "were", "with", "which", "will", "you", "your", "about", "after", "before", "can", "could", "has", "have", "into", "may", "more", "not", "than", "their", "they", "these", "those", "when", "where", "while", "who", "what", "why", "how"
}
TERM_DEFINITIONS = {
    "api": "A set of rules that lets software applications communicate with each other.",
    "algorithm": "A set of steps or rules used to solve a problem.",
    "bandwidth": "The amount of data a network can transfer in a given time.",
    " blockchain": "A shared digital record made of linked groups of transactions.",
    "cloud computing": "Using remote internet-connected computers to store data or run software.",
    "database": "An organized collection of information that can be searched and updated.",
    "encryption": "Changing information into a coded form so others cannot read it without permission.",
    "machine learning": "A way for computers to learn patterns from examples instead of following only fixed rules.",
    "model": "A computer system trained to recognize patterns or produce predictions.",
    "processor": "The part of a computer that carries out instructions.",
    "software": "Programs and instructions that tell a computer what to do.",
    "variable": "A named place in a program where a value can be stored."
}


def _clean_text(text: str) -> str:
    text = text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text is required.")
    return text


def _sentences(text: str):
    return [part.strip() for part in re.split(r"(?<=[.!?])\s+|\n+", text) if part.strip()]


def _language_name(language: str) -> str:
    return LANGUAGES.get(language.lower(), language)


def _model_text(instruction: str, text: str, language: str) -> str | None:
    api_key = os.getenv("OPENAI_API_KEY") or os.getenv("AI_API_KEY")
    if not api_key:
        return None

    payload = json.dumps({
        "model": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        "messages": [
            {"role": "system", "content": f"{instruction} Respond in {_language_name(language)}. Preserve names, numbers, dates, and meaning. Do not invent facts."},
            {"role": "user", "content": text[:24000]}
        ],
        "temperature": 0.2
    }).encode("utf-8")
    request = urllib.request.Request(
        os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1").rstrip("/") + "/chat/completions",
        data=payload,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            result = json.loads(response.read().decode("utf-8"))
        return result["choices"][0]["message"]["content"].strip()
    except (urllib.error.URLError, KeyError, IndexError, json.JSONDecodeError) as error:
        raise HTTPException(status_code=502, detail=f"AI service request failed: {error}") from error


def _ranked_sentences(text: str):
    sentences = _sentences(text)
    frequencies = {}
    for word in re.findall(r"[A-Za-z0-9'-]+", text.lower()):
        if word not in STOP_WORDS and len(word) > 2:
            frequencies[word] = frequencies.get(word, 0) + 1
    scored = []
    for index, sentence in enumerate(sentences):
        words = [word for word in re.findall(r"[A-Za-z0-9'-]+", sentence.lower()) if word not in STOP_WORDS]
        score = sum(frequencies.get(word, 0) for word in words) / max(len(words), 1)
        scored.append((score, index, sentence))
    return sorted(scored, key=lambda item: (-item[0], item[1]))

@app.get("/")
def root():
    return {"message": "SmartExplain API is running"}

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    filename = file.filename or ""
    extension = os.path.splitext(filename)[1].lower()
    if extension not in {".txt", ".pdf", ".docx"}:
        raise HTTPException(status_code=415, detail="Upload a PDF, DOCX, or TXT file.")
    contents = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds the 15 MB upload limit.")
    try:
        if extension == ".txt":
            extracted_text = contents.decode("utf-8-sig")
        elif extension == ".pdf":
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(contents))
            extracted_text = "\n".join(page.extract_text() or "" for page in reader.pages)
        else:
            from docx import Document
            document = Document(io.BytesIO(contents))
            extracted_text = "\n".join(paragraph.text for paragraph in document.paragraphs)
    except ImportError as error:
        raise HTTPException(status_code=500, detail="Install document support with pip install -r requirements.txt.") from error
    except Exception as error:
        raise HTTPException(status_code=400, detail=f"Could not read the document: {error}") from error
    if not extracted_text.strip():
        raise HTTPException(status_code=400, detail="No readable text was found in the document.")
    return {"filename": filename, "text": extracted_text}

@app.post("/simplify")
def simplify_text(text: str = Form(...), language: str = Form("en")):
    text = _clean_text(text)
    simplified = _model_text("Rewrite the supplied text in clear, beginner-friendly language. Keep every important fact and qualification.", text, language)
    if simplified is None:
        replacements = {
            "approximately": "about", "commence": "begin", "demonstrate": "show", "determine": "find out", " sufficient": "enough", " utilize": "use", " terminate": "end", " prior to": "before", " subsequently": "later", "in order to": "to", " due to the fact that": "because"
        }
        simplified = text
        for complex_word, simple_word in replacements.items():
            simplified = re.sub(re.escape(complex_word), simple_word, simplified, flags=re.IGNORECASE)
    return {"simplified": simplified, "language": language, "mode": "ai" if os.getenv("OPENAI_API_KEY") or os.getenv("AI_API_KEY") else "local"}

@app.post("/summarize")
def summarize_text(text: str = Form(...), language: str = Form("en")):
    text = _clean_text(text)
    summary = _model_text("Summarize the document faithfully in a short paragraph. Include its main conclusion and essential facts.", text, language)
    if summary is None:
        sentences = _sentences(text)
        summary = " ".join(sentence for _, _, sentence in _ranked_sentences(text)[:min(3, len(sentences))])
    return {"summary": summary, "language": language}

@app.post("/keypoints")
def keypoints_text(text: str = Form(...), language: str = Form("en")):
    text = _clean_text(text)
    model_result = _model_text("Extract up to five important points from the document. Return one point per line, without numbering.", text, language)
    if model_result is None:
        points = [sentence for _, _, sentence in _ranked_sentences(text)[:5]]
    else:
        points = [line.strip(" -\t") for line in model_result.splitlines() if line.strip()]
    return {"keypoints": points, "language": language}

@app.post("/explain_terms")
def explain_terms(text: str = Form(...), language: str = Form("en")):
    text = _clean_text(text)
    model_result = _model_text("Identify up to eight technical or unfamiliar terms in the text and explain each simply. Return one term | explanation per line.", text, language)
    if model_result is not None:
        terms = []
        for line in model_result.splitlines():
            if "|" in line:
                term, explanation = line.split("|", 1)
                terms.append({"term": term.strip(" -*\t"), "explanation": explanation.strip()})
    else:
        lowered = text.lower()
        terms = [{"term": term.strip(), "explanation": definition} for term, definition in TERM_DEFINITIONS.items() if term.strip() in lowered]
    return {"terms": terms, "language": language}

@app.post("/qa")
def question_answer(text: str = Form(...), question: str = Form(...), language: str = Form("en")):
    text = _clean_text(text)
    question = _clean_text(question)
    answer = _model_text("Answer the question using only the supplied document. If the document does not contain the answer, say that clearly.", f"DOCUMENT:\n{text}\n\nQUESTION:\n{question}", language)
    if answer is None:
        question_words = {word for word in re.findall(r"[A-Za-z0-9'-]+", question.lower()) if word not in STOP_WORDS and len(word) > 2}
        ranked = []
        for sentence in _sentences(text):
            sentence_words = set(re.findall(r"[A-Za-z0-9'-]+", sentence.lower()))
            overlap = len(question_words & sentence_words)
            if overlap:
                ranked.append((overlap / max(len(question_words), 1), sentence))
        answer = max(ranked, default=(0, ""))[1] or "The document does not contain enough information to answer that question."
    return {"answer": answer, "language": language}

@app.post("/download")
def download_simplified(text: str = Form(...), type: str = Form("simplified")):
    text = _clean_text(text)
    filename = re.sub(r"[^A-Za-z0-9_-]+", "_", type).strip("_") or "document"
    return StreamingResponse(
        io.BytesIO(text.encode("utf-8")),
        media_type="text/plain; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}.txt"'}
    )
