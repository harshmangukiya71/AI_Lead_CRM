# AI-Powered Lead Management System

Production-ready MVP for capturing leads, qualifying them with AI, managing them in a CRM dashboard, and sending automatic acknowledgement emails.

## Architecture

```mermaid
flowchart TD
  A[Landing Page + Lead Form] --> B[React Router Frontend]
  B --> C[Express REST API]
  C --> D[Zod Validation]
  D --> E[Prisma ORM]
  E --> F[(PostgreSQL)]
  C --> G[OpenAI Qualification Service]
  G --> E
  C --> H[Mock AI Fallback]
  H --> E
  C --> I[Nodemailer SMTP]
  I --> J[Lead Acknowledgement Email]
  C --> K[CRM Dashboard + Lead Detail]
```

## Features

- Responsive landing page with validated lead capture form.
- PostgreSQL persistence through Prisma ORM.
- CRM dashboard with top summary cards, searchable and filterable lead table, chart-style temperature summary, and recent activity timeline.
- Lead detail page with editable status, owner, notes, and follow-up date.
- AI qualification immediately after lead creation using OpenAI when `OPENAI_API_KEY` is present.
- Rule-based mock AI fallback with the same response structure when OpenAI is unavailable.
- Automatic acknowledgement email through Nodemailer SMTP when SMTP variables are configured.
- AI-generated follow-up email draft on the lead detail page.

## Folder Structure

```text
.
├── backend
│   ├── prisma
│   │   └── schema.prisma
│   └── src
│       ├── config
│       ├── controllers
│       ├── db
│       ├── middleware
│       ├── routes
│       ├── services
│       ├── types
│       └── validation
├── frontend
│   └── src
│       ├── api
│       ├── components
│       ├── pages
│       └── types
└── README.md
```

## Environment Variables

Backend `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lead_management?schema=public"
OPENAI_API_KEY=""
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
PORT="4000"
FRONTEND_URL="http://localhost:5173"
```

Frontend `frontend/.env`:

```env
VITE_API_URL="http://localhost:4000/api"
```

## Setup

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

Create environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Update `DATABASE_URL` and SMTP/OpenAI variables as needed.

## Database Migration

From the `backend` directory:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

For production deployment:

```bash
npx prisma migrate deploy
```

## Run Locally

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`.

## REST API

- `POST /api/leads` creates a lead, qualifies it, stores AI output, and sends acknowledgement email.
- `GET /api/leads` lists leads. Supports `search` and `status` query parameters.
- `GET /api/leads/:id` returns one lead.
- `PUT /api/leads/:id` updates CRM fields.
- `DELETE /api/leads/:id` deletes a lead.
- `GET /api/dashboard` returns dashboard counts, recent leads, and temperature distribution.

## AI Prompt Used

System prompt:

```text
You are an expert B2B sales qualification analyst. Evaluate a lead using industry, company size, budget, and project description. Return ONLY valid JSON with this exact shape: {"leadScore":85,"temperature":"Hot","confidence":93,"reasoning":"short business rationale","nextAction":"specific recommended sales action"}. leadScore and confidence must be integers from 0 to 100. temperature must be one of Hot, Warm, or Cold. Do not include markdown, prose, comments, or extra keys.
```

The user payload sent to the model contains:

```json
{
  "industry": "SaaS",
  "companySize": "51-200",
  "budget": "$50,000",
  "projectDescription": "We need an AI CRM workflow..."
}
```

Expected AI JSON:

```json
{
  "leadScore": 85,
  "temperature": "Hot",
  "confidence": 93,
  "reasoning": "Strong budget, relevant industry, and clear project urgency.",
  "nextAction": "Schedule a discovery call within 24 hours."
}
```

## Deployment

Backend:

1. Provision PostgreSQL and set `DATABASE_URL`.
2. Set `OPENAI_API_KEY` if real AI qualification is required.
3. Set Gmail SMTP variables. For Gmail, use an app password for `SMTP_PASS`.
4. Run `npm install`, `npm run build`, `npx prisma migrate deploy`, then `npm start`.

Frontend:

1. Set `VITE_API_URL` to the deployed backend API URL.
2. Run `npm install` and `npm run build`.
3. Deploy the generated `frontend/dist` folder to a static host.

## Notes

The application remains functional without OpenAI or SMTP credentials. Missing OpenAI credentials activate the mock qualification service; missing SMTP credentials skip email sending while logging that SMTP is not configured.
