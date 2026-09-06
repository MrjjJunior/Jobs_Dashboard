import io
import re
from typing import Dict, Any

def clean_rtf_text(rtf: str) -> str:
    """Strips RTF control codes and groups from raw RTF text."""
    text = re.sub(r"\\'[0-9a-fA-F]{2}", ' ', rtf)
    text = re.sub(r'\\[a-zA-Z]+(-?\d+)? ?', ' ', text)
    text = re.sub(r'[{}]', ' ', text)
    text = re.sub(r'[ \t]+', ' ', text)
    return re.sub(r'\n\s*\n+', '\n\n', text).strip()

def sanitize_extracted_text(raw: str) -> str:
    """Cleans extracted text: removes non-printable bytes, normalizes whitespace and line breaks."""
    if not raw:
        return ""
    # Remove null bytes and non-printable control characters
    text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', raw)
    text = text.replace('\uFFFD', '')
    text = re.sub(r'[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]', ' ', text)
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    
    # Filter out raw PDF bytecode remnants
    lines = [
        line.strip() for line in text.split('\n')
        if not re.match(r'^(%PDF|\d+ \d+ obj|endobj|stream|endstream|xref|trailer|startxref)', line.strip(), re.IGNORECASE)
    ]
    cleaned = '\n'.join(lines)
    return re.sub(r'\n{3,}', '\n\n', cleaned).strip()

def extract_text_from_pdf_fallback(content_bytes: bytes) -> str:
    """Extract plain text streams from PDF without external heavy binaries."""
    try:
        raw = content_bytes.decode('latin-1', errors='ignore')
        matches = re.findall(r'\(([^()]{2,})\)', raw)
        valid_tokens = [
            m.strip() for m in matches 
            if len(m.strip()) > 2 and not m.startswith('/') and 'Font' not in m and 'Length' not in m
        ]
        if len(valid_tokens) > 5:
            return " ".join(valid_tokens)
    except Exception:
        pass
    return ""

def parse_uploaded_document(file_name: str, content_bytes: bytes) -> Dict[str, Any]:
    """
    Parse uploaded file into clean plain text and word count.
    Supports PDF, DOCX, TXT, MD, RTF.
    """
    ext = file_name.split('.')[-1].lower() if '.' in file_name else ''
    text = ""
    file_type = ext.upper()

    try:
        if ext == 'pdf':
            file_type = "PDF Document"
            # Try pypdf if installed, else fallback
            try:
                import pypdf
                reader = pypdf.PdfReader(io.BytesIO(content_bytes))
                pages = [page.extract_text() or "" for page in reader.pages]
                text = "\n\n".join(pages)
            except ImportError:
                text = extract_text_from_pdf_fallback(content_bytes)
            except Exception:
                text = extract_text_from_pdf_fallback(content_bytes)

        elif ext == 'docx':
            file_type = "Word Document (.docx)"
            try:
                import docx
                doc = docx.Document(io.BytesIO(content_bytes))
                text = "\n".join([p.text for p in doc.paragraphs])
            except ImportError:
                # Basic xml-based extraction for docx (which is a zip containing word/document.xml)
                import zipfile
                try:
                    with zipfile.ZipFile(io.BytesIO(content_bytes)) as z:
                        xml_content = z.read("word/document.xml").decode("utf-8", errors="ignore")
                        text = re.sub(r'<[^>]+>', ' ', xml_content)
                except Exception as e:
                    text = f"Error reading docx: {e}"

        elif ext == 'rtf':
            file_type = "Rich Text Format (.rtf)"
            raw = content_bytes.decode("latin-1", errors="ignore")
            text = clean_rtf_text(raw)

        else:
            file_type = ext.upper() or "Text Document"
            text = content_bytes.decode("utf-8", errors="replace")

        cleaned = sanitize_extracted_text(text)
        words = len([w for w in cleaned.split() if w.strip()])

        return {
            "text": cleaned,
            "wordCount": words,
            "fileType": file_type,
            "error": None if cleaned else "No text could be extracted from document."
        }

    except Exception as e:
        return {
            "text": "",
            "wordCount": 0,
            "fileType": file_type,
            "error": str(e)
        }
