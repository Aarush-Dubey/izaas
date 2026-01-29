# IZAAS

IZAAS is a next-generation fintech application that combines generative UI with personal finance management. It acts as a "Roomie Finance Co-Pilot," helping users manage shared expenses, split bills, and gain financial insights through a conversational interface.

## 🚀 Features

- **Generative UI Chat**: Interactive financial assistant powered by [Thesys AI](https://thesys.ai) and the `@thesysai/genui-sdk`.
- **Splitwise Integration**:
  - Seamless OAuth 1.0a connection.
  - Syncs expenses and balances directly to the frontend.
  - Injects financial history as context for the AI agent.
- **Smart Receipt Processing**:
  - OCR capability to extract transaction data from images/PDFs (Backend/Middleware).
- **Double-Entry Ledger**: Robust financial tracking (Backend).

## 🛠️ Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (React), Tailwind CSS, Lucide React, Thesys GenUI SDK.
- **Backend**: [Django](https://www.djangoproject.com/) (Python), Django REST Framework.
- **Middleware**: Python scripts for Vision/OCR processing.
- **Infrastructure**: Docker, Docker Compose.

## 🏁 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (v3.10+)

### 🐳 Running with Docker

 The easiest way to run the full stack is with Docker Compose.

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Aarush-Dubey/izaas.git
    cd izaas
    ```

2.  **Environment Setup**:
    - Copy `.env.example` files to create your local configurations.
    - **Backend**: `cp backend/.env.example backend/.env`
    - **Frontend**: `cp frontend/.env.local.example frontend/.env.local`
    - Fill in the required API keys (OpenAI, Splitwise, Google OAuth, etc.).

3.  **Start Services**:
    ```bash
    docker-compose up --build
    ```
    - Frontend: [http://localhost:3000](http://localhost:3000)
    - Backend: [http://localhost:8000](http://localhost:8000)

### 💻 Manual Setup

If you prefer running services individually:

#### 1. Backend (Django)

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

#### 2. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

## 🔐 Environment Variables

### Frontend (`frontend/.env.local`)

| Variable | Description |
| :--- | :--- |
| `SPLITWISE_CONSUMER_KEY` | Splitwise Application Consumer Key |
| `SPLITWISE_CONSUMER_SECRET` | Splitwise Application Consumer Secret |
| `OPENAI_API_KEY` | (Optional) For direct AI calls if applicable |
| `THESYS_API_KEY` | Key for Thesys AI integration |

### Backend (`backend/.env`)

| Variable | Description |
| :--- | :--- |
| `DJANGO_SECRET_KEY` | Django security key |
| `DJANGO_DEBUG` | `True` for development |
| `SPLITWISE_CONSUMER_KEY` | (Legacy/Backend) Splitwise Key |
| `SPLITWISE_CONSUMER_SECRET`| (Legacy/Backend) Splitwise Secret |
| `GOOGLE_CLIENT_ID` | Google OAuth ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret |

## 📂 Project Structure

- `/frontend`: Next.js web application.
- `/backend`: Django REST API service.
- `/middleware`: Python scripts for OCR and data processing pipelines.
- `/docker-compose.yml`: Orchestration for local development.

## 🤝 Contributing

1.  Fork the repo.
2.  Create a feature branch: `git checkout -b feature/amazing-feature`.
3.  Commit changes: `git commit -m 'Add amazing feature'`.
4.  Push to branch: `git push origin feature/amazing-feature`.
5.  Open a Pull Request.
