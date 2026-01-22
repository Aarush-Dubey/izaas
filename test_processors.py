import unittest
from unittest.mock import MagicMock, patch
import sys
import os

# Add current directory
sys.path.append(os.getcwd())

# Create a dummy class for PIL.Image.Image
class MockPILImage:
    pass

# Mock libraries BEFORE importing
sys.modules['pytesseract'] = MagicMock()
mock_pil = MagicMock()
mock_pil.Image.Image = MockPILImage 
sys.modules['PIL'] = mock_pil
sys.modules['groq'] = MagicMock() 
sys.modules['pdfplumber'] = MagicMock()
sys.modules['dotenv'] = MagicMock()

# Now import
from middleware.img_processor import ImageProcessor
from middleware.pdf_processor import PDFProcessor

class TestProcessors(unittest.TestCase):

    def test_image_processor(self):
        with patch('os.environ.get', return_value="fake-key"):
            processor = ImageProcessor()
        
        # OCR Mock
        mock_pytesseract = sys.modules['pytesseract']
        mock_pytesseract.image_to_string.return_value = "Mocked OCR Text"
        
        self.assertEqual(processor.perform_ocr("dummy.jpg"), "Mocked OCR Text")

        # Vision Mock
        mock_groq_module = sys.modules['groq']
        mock_client = mock_groq_module.Groq.return_value
        mock_response = MagicMock()
        mock_response.choices[0].message.content = "Mocked Vision Analysis"
        mock_client.chat.completions.create.return_value = mock_response

        with patch("builtins.open", unittest.mock.mock_open(read_data=b"fake_image_data")):
            vision_result = processor.analyze_with_vision_model("dummy.jpg")
            self.assertEqual(vision_result, "Mocked Vision Analysis")
            
        # Test Receipt Extraction
        mock_groq_client = processor.client
        mock_receipt_response = MagicMock()
        mock_receipt_response.choices[0].message.content = '{"merchant": "Test Store", "total": 10.00}'
        mock_groq_client.chat.completions.create.return_value = mock_receipt_response
        
        with patch("builtins.open", unittest.mock.mock_open(read_data=b"fake_image_data")):
            receipt_json = processor.extract_receipt_data("dummy.jpg")
            self.assertEqual(receipt_json["merchant"], "Test Store")
            self.assertEqual(receipt_json["total"], 10.00)
            # Check if called with json_object
            self.assertEqual(mock_groq_client.chat.completions.create.call_args[1]['response_format'], {"type": "json_object"})
            
    def test_pdf_processor(self):
        mock_pdfplumber = sys.modules['pdfplumber']
        mock_pdf_obj = MagicMock()
        
        page1 = MagicMock()
        page1.extract_text.return_value = "Normal Text"
        page1.extract_tables.return_value = []
        
        page2 = MagicMock()
        page2.extract_text.return_value = ""
        page2.to_image.return_value.original = MockPILImage()
        page2.to_image.return_value.original.save = MagicMock()
        
        mock_pdf_obj.pages = [page1, page2]
        mock_pdfplumber.open.return_value.__enter__.return_value = mock_pdf_obj

        with patch('middleware.pdf_processor.ImageProcessor') as MockImgProcClass:
            mock_img_instance = MockImgProcClass.return_value
            # Vision fallback response
            mock_img_instance.analyze_with_vision_model.return_value = "Vision Text"
            
            # JSON Parse response (mocking the Groq client inside image processor)
            mock_groq_client = MagicMock()
            mock_img_instance.client = mock_groq_client
            mock_client_response = MagicMock()
            mock_client_response.choices[0].message.content = '{"document_metadata": {"type": "test"}}'
            mock_groq_client.chat.completions.create.return_value = mock_client_response

            processor = PDFProcessor()
            
            # Test extract_text
            text = processor.extract_text("dummy.pdf")
            self.assertIn("Normal Text", text)
            self.assertIn("Vision Text", text)

            # Test parse_financial_data
            json_result = processor.parse_financial_data("Some raw text")
            self.assertEqual(json_result['document_metadata']['type'], "test")
            # Verify we called the LLM with JSON mode
            mock_groq_client.chat.completions.create.assert_called_with(
                model="llama-3.3-70b-versatile",
                messages=unittest.mock.ANY,
                temperature=0,
                response_format={"type": "json_object"}
            )

if __name__ == "__main__":
    unittest.main()
