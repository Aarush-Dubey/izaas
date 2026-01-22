import os
import sys
from PIL import Image, ImageDraw, ImageFont
import time
import json

# Add current directory to path
sys.path.append(os.getcwd())

from middleware.img_processor import ImageProcessor
from middleware.pdf_processor import PDFProcessor


def run_verification():
    
    # 2. Test Image Processor
    print("\n--- Testing ImageProcessor ---")
    img_proc = ImageProcessor()
    
    # Use existing image if possible
    img_path = "image.png"
    if os.path.exists(img_path):
        print(f"Performing OCR on {img_path}...")
        ocr_text = img_proc.perform_ocr(img_path)
        print(f"OCR Result:\n{ocr_text}")
        
        print("\nAnalyzing with Vision Model (Groq)...")
        if not os.environ.get("GROQ_API_KEY"):
            print("WARNING: GROQ_API_KEY not set. Vision analysis might fail.")
        else:
            vision_result = img_proc.analyze_with_vision_model(img_path)
            print(f"Vision Result:\n{vision_result}")
    else:
        print(f"Skipping Image Test ({img_path} not found)")

    # 3. Test PDF Processor
    print("\n--- Testing PDFProcessor ---")
    pdf_proc = PDFProcessor()
    
    pdf_path = "dummy_statement.pdf"
    if os.path.exists(pdf_path):
        print("Extracting Text...")
        pdf_text = pdf_proc.extract_text(pdf_path)
        print(f"PDF Text:\n{pdf_text}")
        
        print("\nStructuring Content...")
        structure = pdf_proc.structure_content(pdf_path)
        print(f"Structure: {structure}")
        
        # New Step: Financial Parsing
        if pdf_text and "Error" not in pdf_text:
            print("\nParsing Financial Data (LLM)...")
            try:
                # Combine text if structure logic was used, or just use extracted text
                # extract_text already returns text (including fallback).
                parsed_data = pdf_proc.parse_financial_data(pdf_text)
                
                # Check for receipt data to include
                final_output = {"bank_statement": parsed_data}
                
                # If we processed an image earlier, let's try to parse it as a receipt too
                if os.path.exists("image.png"):
                    print("\nParsing Receipt Data (Vision)...")
                    receipt_data = img_proc.extract_receipt_data("image.png")
                    print(f"> Receipt JSON:\n{json.dumps(receipt_data, indent=2)}")
                    final_output["receipt"] = receipt_data
                
                print(f"> Final JSON Output:\n{json.dumps(final_output, indent=2)}")
                
                # Save to file
                output_file = "financial_data.json"
                with open(output_file, "w") as f:
                    json.dump(final_output, f, indent=2)
                print(f"\n[SUCCESS] Structured data saved to {output_file}")

            except Exception as e:
                print(f"[ERROR] JSON Parsing failed: {e}")
    else:
        print(f"Skipping PDF Test ({pdf_path} not found)")

if __name__ == "__main__":
    run_verification()
