# iZaas - Intelligent Zero-touch accounting as a Service

iZaas is a next-generation "Finance Co-Pilot" application that integrates automated financial tracking with advanced AI vision capabilities. It allows users to track expenses, manage group settlements (via Splitwise), and analyze financial documents (images/PDFs) using computer vision.

## Features

-   **Dashboard**: A "Stealth/Terminal" themed UI for financial oversight.
-   **AI Chat Agent**: Interact with "iZaas" to query your financial data.
-   **Vision Analysis**: Upload receipts, bills, or financial statements (Image/PDF). The system automatically analyzes them using Groq's Llama Vision model and stores the structured data.
-   **Context-Aware Chat**: The chat agent is aware of your uploaded documents and can answer questions based on their content.
-   **Splitwise Integration**: Sync expenses and settlements with Splitwise. Includes a "Skip" option for quick onboarding.
-   **Automated Profiling**: Automatically creates a user data profile upon registration.

## Architecture

-   **Frontend**: Next.js (App Router), Thesys GenUI SDK, Tailwind CSS.
-   **Backend**: Django REST Framework.
-   **Middleware**: Python-based pipeline for:
    -   User data management (`data/{username}/`).
    -   Vision Model processing (`Groq`).
    -   Financial Analysis logic.

## Prerequisites

-   **Node.js** (v18+)
-   **Python** (v3.10+)
-   **Groq API Key**: For vision model capabilities.
-   **Splitwise API Keys**: For expense syncing (Consumer Key, Secret, API Key).

## Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Aarush-Dubey/izaas.git
cd izaas
```

### 2. Backend Setup
Navigate to the backend directory and set up the virtual environment.

```bash
cd backend
python3 -m venv ../venv
source ../venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install djangorestframework-simplejwt pytesseract pypdf splitwise
```

**Environment Variables (.env)**
Create a `.env` file in `backend/` and `middleware/` (or a shared one loaded by both) with:
```bash
GROQ_API_KEY=your_groq_api_key
SPLITWISE_CONSUMER_KEY=your_key
SPLITWISE_CONSUMER_SECRET=your_secret
SPLITWISE_API_KEY=your_api_key
```

**Run Migrations & Server**
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```
The backend will run on `http://127.0.0.1:8000`.

### 3. Frontend Setup
Navigate to the frontend directory.

```bash
cd frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:3000` (or 3001 if 3000 is taken).

## Usage

1.  **Onboarding**: Open the frontend. Complete the "Stealth" onboarding flow.
    -   **Network Sync**: You can choose to "ESTABLISH LINK" with Splitwise or click `[ BYPASS LINK ]` to skip.
2.  **Upload Documents**:
    -   Click the **Upload Button** (icon) in the top header.
    -   Select a receipt or bill (Image/PDF).
    -   The system processes it and saves the analysis to `backend/data/{username}/uploads/`.
3.  **Chat**:
    -   Type in the chat window.
    -   The agent knows about your recently uploaded document (context is injected automatically).
    -   Example: "What is the total of the bill I just uploaded?"

## Project Structure

-   `backend/`: Django project (`finance` app, `izaas_backend` config).
-   `frontend/`: Next.js application (`src/app`, `src/components`).
-   `middleware/`: Core logic for AI and Data Pipeline (`pipeline.py`, `vision_model.py`, `agent.py`).
-   `data/`: Stores user profiles and uploaded document analysis.
