import os
import json
import base64
import groq
import fitz  # PyMuPDF
from dotenv import load_dotenv
load_dotenv()

class VisionModel:
    def __init__(self, api_key=None, model_name="meta-llama/llama-4-scout-17b-16e-instruct"):
        """
        Initialize the VisionModel with Groq client.
        
        Args:
            api_key (str, optional): Groq API key. If None, it attempts to fetch from environment variable GROQ_API_KEY.
            model_name (str): Name of the vision model to use.
        """
        self.api_key = api_key or os.environ.get("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("Groq API key is required. Set GROQ_API_KEY environment variable or pass it to __init__.")
        
        self.client = groq.Groq(api_key=self.api_key)
        self.model_name = model_name

    def encode_image(self, image_path):
        """
        Encodes an image to base64 string.
        
        Args:
            image_path (str): Path to the image file.
            
        Returns:
            str: Base64 encoded sring of the image.
        """
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')

    def pdf_to_images(self, pdf_path):
        """
        Converts PDF pages to temporary image files and encodes them.
        For simplicity in this version, we will return a list of base64 encoded strings, one for each page.
        
        Args:
            pdf_path (str): Path to the PDF file.
            
        Returns:
            list: List of base64 encoded strings.
        """
        doc = fitz.open(pdf_path)
        encoded_images = []
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            pix = page.get_pixmap()
            # We can convert pixmap to bytes directly
            image_bytes = pix.tobytes("png")
            encoded_string = base64.b64encode(image_bytes).decode('utf-8')
            encoded_images.append(encoded_string)
            
        doc.close()
        return encoded_images

    def analyze_image(self, base64_image, prompt="Describe this image in detail."):
        """
        Sends the image to Groq API for analysis.
        
        Args:
            base64_image (str): Base64 encoded image string.
            prompt (str): Prompt for the model.
            
        Returns:
            str: Model response/analysis.
        """
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}",
                                },
                            },
                        ],
                    }
                ],
                model=self.model_name,
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            return f"Error processing image: {str(e)}"

    def process_file(self, file_path, output_json_path, prompt="Analyze the content of this document/image."):
        """
        Processes a file (Image or PDF), runs vision analysis, and saves results to a JSON file.
        
        Args:
            file_path (str): Path to the input file.
            output_json_path (str): Path to save the output JSON.
            prompt (str): Analysis prompt.
        """
        file_ext = os.path.splitext(file_path)[1].lower()
        results = {
            "file_path": file_path,
            "type": "unknown",
            "analysis": []
        }

        if file_ext in ['.pdf']:
            results["type"] = "pdf"
            print(f"Processing PDF: {file_path}...")
            encoded_images = self.pdf_to_images(file_path)
            for i, img_b64 in enumerate(encoded_images):
                print(f"Analyzing page {i+1}/{len(encoded_images)}...")
                page_analysis = self.analyze_image(img_b64, prompt=f"Page {i+1}: {prompt}")
                results["analysis"].append({
                    "page": i + 1,
                    "content": page_analysis
                })
        
        elif file_ext in ['.jpg', '.jpeg', '.png', '.bmp', '.gif']:
            results["type"] = "image"
            print(f"Processing Image: {file_path}...")
            img_b64 = self.encode_image(file_path)
            analysis = self.analyze_image(img_b64, prompt=prompt)
            results["analysis"].append({
                "page": 1,
                "content": analysis
            })
        
        else:
            print(f"Unsupported file type: {file_ext}")
            return

        # Ensure directory exists
        os.makedirs(os.path.dirname(output_json_path), exist_ok=True)
        
        with open(output_json_path, 'w') as f:
            json.dump(results, f, indent=4)
        
        print(f"Results saved to {output_json_path}")

if __name__ == "__main__":
    # Example Usage (Commented out)
    # vision_model = VisionModel()
    # vision_model.process_file("path/to/image.jpg", "output.json")
    pass
