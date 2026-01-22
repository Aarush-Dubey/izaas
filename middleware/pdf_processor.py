import pdfplumber
from typing import List, Dict, Any
from middleware.img_processor import ImageProcessor

class PDFProcessor:
    """
    Processor for parsing and structuring PDF documents.
    """
    def __init__(self):
        # Initialize ImageProcessor for fallback
        self.img_processor = ImageProcessor()

    def extract_text(self, pdf_path: str) -> str:
        """
        Extract full text from a PDF file. 
        If extraction yields empty text (scanned PDF), falls back to Vision Model.
        
        Args:
            pdf_path: Path to the PDF file.
            
        Returns:
            Concatenated text from all pages.
        """
        full_text = []
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for idx, page in enumerate(pdf.pages):
                    text = page.extract_text()
                    
                    # Debug print
                    # print(f"[DEBUG] Page {idx+1} raw text length: {len(text) if text else 0}")
                    # if text:
                    #     print(f"[DEBUG] Raw text content (first 50): {repr(text[:50])}")

                    # Check if text is effectively empty
                    if not text or len(text.strip()) < 10:
                        print(f"[DEBUG] Page {idx+1} treated as scanned/empty. Triggering Vision fallback...")
                        try:
                            # Convert page to image
                            pil_image = page.to_image(resolution=300).original
                            vision_text = self.img_processor.analyze_with_vision_model(
                                pil_image, 
                                prompt="Transcribe the text in this document page exactly as it appears. ignore images."
                            )
                            # print(f"[DEBUG] Vision Model response length: {len(vision_text) if vision_text else 0}")
                            text = vision_text
                        except Exception as ve:
                            error_msg = f"[Error using Vision on page {idx+1}: {ve}]"
                            print(error_msg)
                            text = error_msg
                    
                    if text:
                        full_text.append(text)
            return "\n\n".join(full_text)
        except Exception as e:
            return f"Error extracting PDF text: {str(e)}"

    def structure_content(self, pdf_path: str) -> List[Dict[str, Any]]:
        """
        Extract text and structure it by page number.
        Handles scanned pages via vision fallback.
        
        Args:
            pdf_path: Path to the PDF file.
            
        Returns:
            List of dictionaries containing page number and content.
        """
        structured_data = []
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for i, page in enumerate(pdf.pages):
                    text = page.extract_text()
                    
                    is_scanned = False
                    if not text or len(text.strip()) < 10:
                         is_scanned = True
                         try:
                            pil_image = page.to_image(resolution=300).original
                            text = self.img_processor.analyze_with_vision_model(
                                pil_image, 
                                prompt="Transcribe the text from this page. Return **ONLY** the text content."
                            )
                         except Exception as ve:
                            text = f"[Error reading scanned page: {ve}]"
                    
                    structured_data.append({
                        "page_number": i + 1,
                        "content": text if text else "",
                        "is_scanned": is_scanned,
                        "tables": page.extract_tables() # Might be empty for scanned
                    })
            return structured_data
        except Exception as e:
            return [{"error": f"Error structuring PDF: {str(e)}"}]

    def parse_financial_data(self, text: str) -> Dict[str, Any]:
        """
        Parse raw financial text into a structured JSON using LLM.
        
        Args:
            text: Raw text from the document.
            
        Returns:
            Dictionary matching the financial data schema.
        """
        import json
        
        # Access Groq client from the image processor instance
        client = self.img_processor.client
        model = "llama-3.3-70b-versatile" # Updated to supported model
        
        system_prompt = """
        You are an expert financial data parser. Your job is to extract structured data from raw bank statement text.
        
        Output MUST be a valid JSON object with the following schema:
        {
          "document_metadata": {
            "type": "bank_statement",
            "institution": "Name OR Unknown",
            "account_holder": "Name OR Unknown",
            "period_end": "YYYY-MM-DD",
            "currency": "USD"
          },
          "summary": {
            "opening_balance": 0.00,
            "closing_balance": 0.00,
            "total_deposits": 0.00,
            "total_withdrawals": 0.00
          },
          "transactions": [
            {
              "date": "YYYY-MM-DD",
              "description": "Cleaned Description (remove IDs/codes)",
              "category_hint": "Category/Subcategory",
              "type": "debit/credit",
              "amount": 0.00,
              "is_recurring": boolean
            }
          ]
        }
        
        Rules:
        1. Standardize dates to YYYY-MM-DD. Infer year from context if missing.
        2. Clean descriptions (e.g. "WAL-MART #3492" -> "Wal-Mart").
        3. Withdrawals are DEBITS (positive amount in JSON, logic handled by type).
        4. Return ONLY the JSON object. No markdown formatting.
        """
        
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Extract data from this text:\n\n{text}"}
                ],
                temperature=0,
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            return json.loads(content)
        except Exception as e:
            return {"error": f"LLM Parsing failed: {str(e)}", "raw_text_snippet": text[:200]}
