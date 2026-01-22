import os
import io
from PIL import Image, ImageDraw
from vision_model import VisionModel

def create_dummy_image(path):
    # Create a simple image with some text
    img = Image.new('RGB', (200, 100), color = (73, 109, 137))
    d = ImageDraw.Draw(img)
    d.text((10,10), "Hello Vision Model", fill=(255, 255, 0))
    img.save(path)
    print(f"Created dummy image at {path}")

def test_vision_model():
    image_path = "test_image.png"
    output_path = "test_output.json"
    
    # Create a dummy image
    create_dummy_image(image_path)
    
    try:
        # Check for API Key
        if not os.environ.get("GROQ_API_KEY"):
            print("WARNING: GROQ_API_KEY not found in environment. Test might fail if not provided.")
            # For the purpose of this automated test run, we might just stop if no key is present
            # But the user might have it.
        
        # Initialize model
        print("Initializing VisionModel...")
        vm = VisionModel()
        
        # Process
        print("Processing...")
        vm.process_file(image_path, output_path, prompt="What text is written in this image?")
        
        # Check output
        if os.path.exists(output_path):
            print("Success! Output file created.")
            import json
            with open(output_path, 'r') as f:
                data = json.load(f)
                print("Output JSON content:")
                print(json.dumps(data, indent=2))
        else:
            print("Failed! Output file not found.")
            
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        # Cleanup
        if os.path.exists(image_path):
            os.remove(image_path)
        # We assume we want to keep the output for inspection, or we can remove it.
        # os.remove(output_path) 

if __name__ == "__main__":
    test_vision_model()
