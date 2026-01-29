# IZAAS Backend

The backend service for IZAAS, built with **Django** and **Django REST Framework (DRF)**. It handles data persistence for financial records, user management, and advanced processing tasks like receipt OCR.

## 🏗️ Architecture

- **Framework**: Django 5.x + DRF
- **Database**: SQLite (default for dev) / PostgreSQL compatible
- **Authentication**: Custom Auth / integration with Allauth (Google).

## 🔧 Features

- **Finance App (`finance`)**:
  - Models for `Transaction`, `Ledger`, `Category`.
  - Service logic for syncing with external APIs.
- **OCR Integration**: Interfaces with middleware scripts for document processing.

## 🚀 Getting Started

### 1. Environment Setup

Create a virtual environment:

```bash
python -m venv venv
# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configuration

Create a `.env` file based on `.env.example`:

```env
DJANGO_SECRET_KEY='your_secret'
DJANGO_DEBUG=True
GOOGLE_CLIENT_ID='...'
GOOGLE_CLIENT_SECRET='...'
# ... other keys
```

### 4. Database Migrations

```bash
python manage.py migrate
```

### 5. Run Server

```bash
python manage.py runserver 0.0.0.0:8000
```
