# IZAAS Frontend

The frontend for the IZAAS application, built with **Next.js 16** and the **Thesys GenUI SDK**. It provides a rich, conversational interface for managing finances and interacting with the "Roomie Finance Co-Pilot".

## ✨ Key Features

- **Generative UI**: Uses `@thesysai/genui-sdk` to render interactive components (charts, tables, forms) dynamically within the chat stream.
- **Splitwise Integration**:
  - **Frontend-Only OAuth Flow**: Authenticates with Splitwise directly from the client (via Next.js API routes proxying to handle secrets securely).
  - **Context Injection**: Injects user's Splitwise transaction history as hidden context for the AI model.
- **Themed UI**: Custom sidebar, onboarding flow, and styling using Tailwind CSS.

## 🚀 Getting Started

### 1. Installation

```bash
npm install
# or
yarn install
```

### 2. Environment Variables

Create a `.env.local` file based on `.env.local.example`:

```env
SPLITWISE_CONSUMER_KEY="your_key"
SPLITWISE_CONSUMER_SECRET="your_secret"
OPENAI_API_KEY="your_openai_key" # If using direct OpenAI calls
THESYS_API_KEY="your_thesys_key"
```

### 3. Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal).

## 📁 Structure

- `src/app`: App Router pages and layouts.
  - `page.tsx`: Main chat interface.
  - `splitwise/callback`: OAuth callback handler.
  - `api/`: Next.js Route Handlers (API proxies for Splitwise, Chat).
- `src/components`: UI components (`Sidebar`, `Onboarding`, etc.).
- `src/lib`: Utility functions (`splitwise.ts` for OAuth signatures).
- `src/services`: Client-side data fetching services.

## 🔌 API Routes

- `/api/splitwise/auth`: Generates Splitwise OAuth authorization URL.
- `/api/splitwise/token`: Swaps OAuth verifier for access tokens.
- `/api/splitwise/expenses`: Proxies requests to fetch Splitwise expenses.
- `/api/chat`: Handles chat stream and context injection for Thesys/OpenAI.
