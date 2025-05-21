# Zleek-AI-MMNeural-Agent-
Multimodal Neural Agent powered by OpenAI, Google, Anthropic, and Zleek AI
Perfect. Here is the complete `README.md` for your **Supabase + React Multimodal Neural Assistant App**, including:

* Full setup instructions for React + Supabase Edge Functions
* `.env.example` file structure
* Stripe & AI API key setup
* Deployment steps for both **Vercel (frontend)** and **Supabase (backend)**
* Notes on `.env` and `.gitignore`

---

```md
# 🧠 Multimodal Neural Assistant — Supabase + React + Stripe

This is a full-stack AI assistant web app built with:

- **React + Vite + TypeScript** (Frontend)
- **Supabase** (Auth, Database, Edge Functions)
- **Stripe** (Subscription Payments)
- **OpenAI**, **Claude.ai**, and **Google Gemini** (AI APIs)

The assistant's capabilities scale based on the user's **subscription tier**:
- 🟢 **Free**: ChatGPT 3.5, 5 image generations
- 🟡 **Plus**: GPT-4 + Claude
- 🔵 **Pro**: GPT-4o + Claude + Gemini (merged output)
- 🟣 **Neural**: Adds multimodal, voice, memory, developer access

---

## 🧰 Features

- 🔐 Supabase Auth (Email/Password)
- 💬 Chat with AI (via Edge Function `ai-chat`)
- 🎨 Image generation (DALL·E via `ai-image`)
- 💳 Stripe Checkout & Webhooks for billing
- 📊 Usage metering + token balance display
- 🔒 Full Row-Level Security (RLS) enforced

---

## ⚙️ Prerequisites

- Node.js ≥ 18
- Supabase account
- Stripe account
- API keys for:
  - OpenAI
  - Claude (Anthropic)
  - Google Gemini

---

## 📁 Project Structure

```

/
├─ supabase/                 # Supabase functions and SQL
│  ├─ functions/
│  │  ├─ stripe-checkout/
│  │  ├─ stripe-webhooks/
│  │  ├─ ai-chat/
│  │  └─ ai-image/
│  └─ migrations/
├─ src/                      # React frontend
│  ├─ components/
│  │  ├─ Auth.tsx
│  │  ├─ Chat.tsx
│  │  ├─ ImageGen.tsx
│  │  ├─ Subscription.tsx
│  │  └─ Usage.tsx
│  ├─ App.tsx
│  ├─ main.tsx
│  └─ supabaseClient.ts
├─ .env                     # DO NOT COMMIT – API keys live here
├─ .env.example            # Sample environment config
├─ package.json
├─ vite.config.ts
└─ README.md

````

---

## 📦 Installation

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/multimodal-assistant.git
cd multimodal-assistant
````

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

* Create a new project at [https://app.supabase.com](https://app.supabase.com)
* Import the provided SQL schema (from `supabase/schema.sql`)
* Enable **Row-Level Security**
* Deploy Edge Functions:

```bash
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhooks
supabase functions deploy ai-chat
supabase functions deploy ai-image
```

### 4. Set your environment variables

Copy the example and fill in your secrets:

```bash
cp .env.example .env
```

> ⚠️ `.env` is included in `.gitignore` by default. Never commit secrets.

---

## 🌐 Running Locally

### Frontend (Vite)

```bash
npm run dev
```

Access at: [http://localhost:5173](http://localhost:5173)

### Supabase Edge Functions (locally)

```bash
supabase start
supabase functions serve --env-file .env.local
```

---

## 🚀 Deploy to Production

### Frontend on Vercel

1. Push the repo to GitHub
2. Go to [vercel.com/import](https://vercel.com/import)
3. Connect your repo and add the following **env vars**:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

4. Deploy 🚀

### Backend on Supabase

* Functions are hosted directly on Supabase.
* Use the Supabase CLI to redeploy when updating functions:

```bash
supabase functions deploy <function-name>
```

### Stripe Setup

1. Add your **Price IDs** in Stripe dashboard.
2. Use them in the UI in `Subscription.tsx`
3. Add Stripe secret keys to your `.env`

---

## 🧪 .env.example

```ini
# .env.example (DO NOT COMMIT .env)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_URL=https://your-project.supabase.co

STRIPE_API_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SIGNING_SECRET=whsec_xxxx
FRONTEND_URL=http://localhost:5173

OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=your-gemini-api-key
```

---

## 🔐 Security

* All Edge Functions validate Supabase Auth tokens
* RLS (Row-Level Security) ensures users only see their own data
* API keys are never exposed in the frontend

---

## ✅ TODO / Roadmap

* [ ] Add voice support via OpenAI Whisper
* [ ] Add assistant personality customization
* [ ] Add DALL·E image history download
* [ ] Add notification/email alerts for usage caps

---

## 🧠 Credits

Built with:

* Supabase
* Vite + React
* Stripe
* OpenAI / Anthropic / Gemini

---

## 🛡️ License

MIT — Use freely with attribution.
