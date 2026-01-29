# IZAAS Middleware / AI Pipelines

This directory contains standalone Python scripts and modules for advanced AI processing tasks, specifically Computer Vision and OCR capabilities.

## 🧠 Components

- **`vision_model.py`**: Integration with Vision Language Models (e.g., Llama 3.2 Vision, GPT-4o) for analyzing receipt images and extracting structured financial data.
- **`pipeline.py`**: Orchestration logic for data processing pipelines.
- **`agent.py`**: Support for autonomous agentic behaviors.

## 📦 Usage

These scripts are typically invoked by the Backend service or run as standalone workers.

### Dependencies

Ensure you have the required Python packages installed (often shared with the backend or specified in a separate requirements file).

```bash
pip install -r ../backend/requirements.txt
# (Additional vision-specific deps might be required depending on the model used)
```
