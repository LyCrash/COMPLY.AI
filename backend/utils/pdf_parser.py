"""
PDF Parser Utility

Simple wrapper around PyPDF2 for extracting text from privacy policy PDFs
"""

import PyPDF2
from typing import Optional


def extract_text_from_pdf(pdf_file) -> str:
    """
    Extract text content from a PDF file

    Args:
        pdf_file: File-like object containing PDF data

    Returns:
        str: Extracted text from all pages

    Raises:
        Exception: If PDF parsing fails
    """
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text_content = []

        for page in pdf_reader.pages:
            text = page.extract_text()
            if text:
                text_content.append(text)

        return "\n".join(text_content)

    except Exception as e:
        raise Exception(f"Failed to parse PDF: {str(e)}")


def extract_text_from_uploaded_file(uploaded_file) -> str:
    """
    Extract text from FastAPI UploadFile

    Args:
        uploaded_file: FastAPI UploadFile object

    Returns:
        str: Extracted text content
    """
    if uploaded_file.filename.endswith(".pdf"):
        return extract_text_from_pdf(uploaded_file.file)
    elif uploaded_file.filename.endswith(".txt"):
        content = uploaded_file.file.read()
        return content.decode("utf-8")
    else:
        raise ValueError(f"Unsupported file type: {uploaded_file.filename}")
