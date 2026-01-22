import os
import pytesseract
from PIL import Image
from groq import Groq
from typing import Optional, Dict, Any
from dotenv import load_dotenv
load_dotenv()

class ImageProcessor:
    """
    Processor for handling image interpretation using OCR and Vision Models via Groq.
    """
    def __init__(self, tesseract_cmd: Optional[str] = None):
        """
        Initialize the ImageProcessor.
        
        Args:
            tesseract_cmd: Optional path to the tesseract executable.
                           If None, relies on system PATH.
        """
        if tesseract_cmd:
            pytesseract.pytesseract.tesseract_cmd = tesseract_cmd
            
        # Initialize Groq client (expects GROQ_API_KEY env var)
        self.client = Groq(
            api_key=os.environ.get("GROQ_API_KEY"),
        )
        # Using Llama 3.2 90b Vision Preview as the default model
        self.model = "meta-llama/llama-4-scout-17b-16e-instruct"

    def perform_ocr(self, image_path: str) -> str:
        """
        Extract text from an image using OCR.
        
        Args:
            image_path: Path to the image file.
            
        Returns:
            Extracted text as a string.
        """
        try:
            image = Image.open(image_path)
            text = pytesseract.image_to_string(image)
            return text.strip()
        except Exception as e:
            return f"Error performing OCR: {str(e)}"

    def analyze_with_vision_model(self, image_input: Any, prompt: str = "Describe this image in detail.") -> str:
        """
        Analyze an image using a Vision Model via Groq.
        
        Args:
            image_input: Path to the image file (str) OR a PIL Image object.
            prompt: User prompt for the vision model.
            
        Returns:
            Model's interpretation mapping.
        """
        import base64
        import io

        def encode_image(img_inp):
            if isinstance(img_inp, str):
                # It's a file path
                with open(img_inp, "rb") as image_file:
                    return base64.b64encode(image_file.read()).decode('utf-8')
            elif isinstance(img_inp, Image.Image):
                # It's a PIL Image
                buffered = io.BytesIO()
                img_inp.save(buffered, format="JPEG")
                return base64.b64encode(buffered.getvalue()).decode('utf-8')
            else:
                raise ValueError("Invalid image input. Must be path or PIL Image.")

        try:
            base64_image = encode_image(image_input)

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}"
                                },
                            },
                        ],
                    }
                ],
                max_tokens=1000, # Increased tokens for document reading
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error calling Vision Model: {str(e)}"

    def extract_receipt_data(self, image_input: Any) -> Dict[str, Any]:
        """
        Extract structured receipt data using Vision Model.
        
        Args:
            image_input: Path or PIL Image.
            
        Returns:
            JSON object with receipt details.
        """
        import base64
        import io
        import json

        def encode_image(img_inp):
            if isinstance(img_inp, str):
                with open(img_inp, "rb") as image_file:
                    return base64.b64encode(image_file.read()).decode('utf-8')
            elif isinstance(img_inp, Image.Image):
                buffered = io.BytesIO()
                img_inp.save(buffered, format="JPEG")
                return base64.b64encode(buffered.getvalue()).decode('utf-8')
            else:
                raise ValueError("Invalid input")

        system_prompt = """
        You are an expert receipt parser. Extract data into this JSON schema:
        {
          "merchant": "Name",
          "date": "YYYY-MM-DD",
          "total_amount": 0.00,
          "currency": "USD",
          "tax_amount": 0.00,
          "items": [
            {"description": "item name", "quantity": 1, "unit_price": 0.00, "total_price": 0.00}
          ]
        }
        infer missing quantity as 1.
        """

        try:
            base64_image = encode_image(image_input)
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "Extract receipt data to JSON."},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}"
                                },
                            },
                        ],
                    }
                ],
                max_tokens=1000,
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            return {"error": f"Receipt Parsing failed: {str(e)}"}

    def process_image(self, image_path: str) -> Dict[str, Any]:
        """
        Comprehensive processing: performs both OCR and Vision analysis.
        """
        ocr_result = self.perform_ocr(image_path)
        vision_result = self.analyze_with_vision_model(
            image_path, 
            prompt="Analyze the visual structure and content of this image."
        )
        
        return {
            "ocr_text": ocr_result,
            "vision_analysis": vision_result
        }
