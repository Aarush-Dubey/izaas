import pytesseract
from PIL import Image
from pypdf import PdfReader
import io

def extract_text_from_file(file_obj):
    """
    Extracts text from a file object (PDF or Image).
    Returns the extracted text as a string.
    """
    text = ""
    try:
        if file_obj.name.lower().endswith('.pdf'):
            reader = PdfReader(file_obj)
            for page in reader.pages:
                text += page.extract_text() + "\n"
        elif file_obj.name.lower().endswith(('.png', '.jpg', '.jpeg')):
            image = Image.open(file_obj)
            # Tesseract might not be in PATH, so this could fail if not installed on OS.
            # We wrap in try-except specific to tesseract if needed, but for now generic.
            try:
                text = pytesseract.image_to_string(image)
            except Exception as e:
                text = f"[OCR Failed: {str(e)}]. Please ensure Tesseract-OCR is installed on the server."
        else:
             text = "[Unsupported file type for automated extraction]"
    except Exception as e:
        text = f"[Extraction Error: {str(e)}]"
    
    return text
