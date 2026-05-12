import fitz  # PyMuPDF
from docx import Document
import base64
import io

def process_file(file_bytes: bytes, filename: str, mime_type: str) -> dict:
    """
    Processes the file based on its type.
    Returns a dict with 'type' (image or text) and the 'content' (base64 string or extracted text).
    """
    if mime_type in ["image/jpeg", "image/png", "image/webp"] or filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        # Directly encode image
        base64_image = base64.b64encode(file_bytes).decode('utf-8')
        mime_to_use = mime_type if mime_type else "image/jpeg"
        return {"type": "image", "content": [f"data:{mime_to_use};base64,{base64_image}"]}

    elif mime_type == "application/pdf" or filename.lower().endswith(".pdf"):
        # Convert first page of PDF to image
        pdf_document = fitz.open(stream=file_bytes, filetype="pdf")
        images = []
        # Process up to 3 pages
        for page_num in range(min(3, len(pdf_document))):
            page = pdf_document.load_page(page_num)
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom for better resolution
            img_bytes = pix.tobytes("png")
            base64_image = base64.b64encode(img_bytes).decode('utf-8')
            images.append(f"data:image/png;base64,{base64_image}")
        return {"type": "image", "content": images}

    elif mime_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" or filename.lower().endswith(".docx"):
        # Extract text from DOCX
        doc = Document(io.BytesIO(file_bytes))
        full_text = []
        for para in doc.paragraphs:
            full_text.append(para.text)
        return {"type": "text", "content": "\n".join(full_text)}

    else:
        raise ValueError(f"Unsupported file format: {mime_type} / {filename}")
