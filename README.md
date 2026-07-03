# AI-Powered Lead Management System

A full-stack lead capture and CRM application built for the Delipat AI Engineer Internship assessment. The app captures a lead from a landing page, stores it in PostgreSQL, qualifies it with AI, sends an acknowledgement email, and shows the result inside a CRM dashboard.

## Submission Links

- Frontend deployment: https://ai-lead-crm-ten.vercel.app/
- Backend deployment: https://ai-lead-crm-4anx.onrender.com
- API base URL: https://ai-lead-crm-4anx.onrender.com/api

## Features

- Landing page with a validated lead capture form.
- CRM dashboard with Total Leads, New Leads, Qualified Leads, and Lost Leads cards.
- Search and status filter for leads.
- Lead detail page with editable status, owner, notes, and follow-up date.
- AI qualification for lead score, temperature, confidence, reasoning, and next action.
- Automatic acknowledgement email using Nodemailer SMTP.
- Follow-up email draft on the lead detail page.
- PostgreSQL persistence using Prisma ORM.
- Secure CORS support for localhost and Vercel deployments.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router, Axios
- Backend: Node.js, Express, TypeScript, Zod, CORS, Helmet, Morgan
- Database: PostgreSQL with Prisma ORM
- AI: OpenAI chat completions with a rule-based fallback
- Email: Nodemailer SMTP
- Deployment: Vercel frontend, Render backend

## Architecture Overview

The application is split into a Vite React frontend and an Express API backend. The frontend calls the backend through Axios using `VITE_API_URL`. The backend validates requests with Zod, writes data through Prisma, calls the AI qualification service, sends an acknowledgement email, and returns the enriched lead to the CRM.

## Architecture Diagram

```mermaid
flowchart TD
  Visitor[Website visitor] --> Landing[React landing page]
  Landing --> Form[Lead capture form]
  Form --> Axios[Axios API client]
  Axios --> API[Express API on Render]

  API --> CORS[CORS allowlist: localhost + Vercel deployments]
  API --> Validation[Zod validation]
  Validation --> LeadService[Lead service]
  LeadService --> Prisma[Prisma ORM]
  Prisma --> DB[(PostgreSQL database)]

  LeadService --> AI[OpenAI qualification service]
  AI --> Normalize[Normalize AI JSON output]
  Normalize --> Prisma

  LeadService --> Email[Nodemailer acknowledgement email]
  Email --> LeadInbox[Lead email inbox]

  Axios --> Dashboard[CRM dashboard]
  Dashboard --> LeadDetail[Lead detail page]
  LeadDetail --> UpdateAPI[PUT /api/leads/:id]
  UpdateAPI --> API
```

## Core Flow

1. A visitor submits the lead form with name, email, phone, company, industry, company size, budget, and project description.
2. `POST /api/leads` validates the payload with Zod.
3. The backend creates the lead in PostgreSQL using Prisma.
4. The AI service scores the lead and returns structured qualification JSON.
5. The backend stores the AI score, temperature, confidence, reasoning, and next action.
6. The email service sends an acknowledgement email when SMTP is configured.
7. The dashboard reads `GET /api/leads` and `GET /api/dashboard`.
8. The sales user can open a lead detail page and update CRM fields.

## Database Schema

The data model is intentionally simple: one `Lead` table stores both the captured visitor data and the CRM/AI enrichment fields. This keeps the assessment MVP easy to review while still supporting the full website to CRM to AI workflow.

```prisma
enum LeadStatus {
  New
  Qualified
  Lost
}

enum LeadTemperature {
  Hot
  Warm
  Cold
}

model Lead {
  id                 String          @id @default(cuid())
  name               String
  email              String
  phone              String
  company            String?
  industry           String?
  companySize        String?
  budget             String?
  projectDescription String
  status             LeadStatus      @default(New)
  owner              String?
  notes              String?
  followUpDate       DateTime?
  leadScore          Int?
  temperature        LeadTemperature?
  confidence         Int?
  reasoning          String?
  nextAction         String?
  createdAt          DateTime        @default(now())
  updatedAt          DateTime        @updatedAt

  @@index([status])
  @@index([email])
  @@index([createdAt])
}
```

### Schema Notes

| Field | Purpose |
| --- | --- |
| `name`, `email`, `phone` | Required visitor identity and contact fields. |
| `company`, `industry`, `companySize`, `budget` | Qualification context used by AI and the CRM. |
| `projectDescription` | Required long-form lead requirement. |
| `status` | CRM pipeline state: `New`, `Qualified`, or `Lost`. |
| `owner`, `notes`, `followUpDate` | Editable sales management fields. |
| `leadScore` | AI score from 0 to 100. |
| `temperature` | AI classification: `Hot`, `Warm`, or `Cold`. |
| `confidence` | AI confidence percentage from 0 to 100. |
| `reasoning` | Short explanation for the score. |
| `nextAction` | Recommended sales action. |
| `createdAt`, `updatedAt` | Timeline and dashboard sorting fields. |

Indexes are added for `status`, `email`, and `createdAt` because the dashboard filters by status, searches by lead identity, and orders recent leads by creation time.

## API Routes

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/leads` | Create a lead, run AI qualification, store the result, and send acknowledgement email. |
| `GET` | `/api/leads` | List leads with optional `search` and `status` query params. |
| `GET` | `/api/leads/:id` | Get one lead for the detail page. |
| `PUT` | `/api/leads/:id` | Update status, owner, notes, and follow-up date. |
| `DELETE` | `/api/leads/:id` | Delete a lead. |
| `GET` | `/api/dashboard` | Return dashboard cards, recent leads, and temperature distribution. |
| `GET` | `/health` | Basic backend health check. |

## AI Prompt Examples

### 1. Lead Qualification System Prompt

This is the main prompt used in `backend/src/services/aiService.ts`.

```text
You are an expert B2B sales qualification analyst. Evaluate a lead using industry, company size, budget, and project description. Return ONLY valid JSON with this exact shape: {"leadScore":85,"temperature":"Hot","confidence":93,"reasoning":"short business rationale","nextAction":"specific recommended sales action"}. leadScore and confidence must be integers from 0 to 100. temperature must be one of Hot, Warm, or Cold. Do not include markdown, prose, comments, or extra keys.
```

The user message is sent as structured JSON:

```json
{
  "industry": "SaaS",
  "companySize": "51-200",
  "budget": "$50,000",
  "projectDescription": "We need an AI CRM workflow to qualify inbound demo requests and automate sales follow-up."
}
```

Expected model response:

```json
{
  "leadScore": 85,
  "temperature": "Hot",
  "confidence": 93,
  "reasoning": "Strong budget, relevant SaaS use case, and clear automation need.",
  "nextAction": "Schedule a discovery call within 24 hours and prepare a tailored CRM automation proposal."
}
```

### 2. Fallback Qualification Logic

If `OPENAI_API_KEY` is missing or the AI request fails, the backend uses deterministic fallback scoring. The fallback considers:

- Budget signal
- Industry availability
- Company size
- Project urgency words such as `urgent`, `immediate`, or `asap`
- Project relevance words such as `automation`, `ai`, or `crm`
- Description detail level

This keeps the demo functional even without paid AI credentials.

### 3. Acknowledgement Email Template

The automation email is generated from the submitted lead data:

```text
Hi {name},

Thank you for sharing your project with us. {industryLine}

We received your note: "{projectDescription}"

Our sales team will review the details and contact you shortly.

Best,
Lead Management Team
```

### 4. AI Coding Assistant Prompts Used

These are examples of prompts used while building and debugging the project:

```text
Build a TypeScript Express API for a lead management system with routes for creating leads, listing leads, updating CRM fields, and returning dashboard metrics. Use Prisma and Zod validation.
```

```text
Create an AI qualification service that accepts industry, company size, budget, and project description, then returns JSON with leadScore, temperature, confidence, reasoning, and nextAction.
```

```text
Improve the React lead form so validation errors are shown clearly and backend API errors display the real response message instead of a generic connection error.
```

```text
Fix CORS for a Render backend used by a Vercel frontend. Allow localhost and all Vercel preview deployments for this project without using a wildcard origin with credentials.
```

## Setup

### 1. Clone and Install

```bash
git clone <your-repository-url>
cd Delipat_Assignment
```

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

### 2. Environment Variables

Create `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
OPENAI_API_KEY=""
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
PORT="4000"
FRONTEND_URL="http://localhost:5173"
VERCEL_PROJECT_NAME="ai-lead-crm"
```

Create `frontend/.env`:

```env
VITE_API_URL="http://localhost:4000/api"
```

For production, set `VITE_API_URL` to:

```env
VITE_API_URL="https://ai-lead-crm-4anx.onrender.com/api"
```

### 3. Database Setup

From the `backend` folder:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

For production:

```bash
npx prisma migrate deploy
```

### 4. Run Locally

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open:

```text
http://localhost:5173
```

## Deployment Notes

### Backend on Render

Use these commands/settings:

```bash
npm install
npm run build
npx prisma migrate deploy
npm start
```

Required Render environment variables:

```env
DATABASE_URL="your-production-postgresql-url"
OPENAI_API_KEY="your-openai-key"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email"
SMTP_PASS="your-app-password"
FRONTEND_URL="https://your-vercel-production-domain.vercel.app"
VERCEL_PROJECT_NAME="ai-lead-crm"
```

`FRONTEND_URL` supports comma-separated origins if you also use a custom domain.

### Frontend on Vercel

Set this Vercel environment variable:

```env
VITE_API_URL="https://ai-lead-crm-4anx.onrender.com/api"
```

Then deploy the `frontend` app.

## CORS Configuration

The backend allows:

- `http://localhost:5173`
- `http://127.0.0.1:5173`
- Origins listed in `FRONTEND_URL`
- Vercel preview and production deployments matching `VERCEL_PROJECT_NAME`, for example `https://ai-lead-crm-git-main-xxxxx.vercel.app`

This fixes browser CORS errors for Vercel preview deployments while still avoiding `*` with credentials.

## Project Structure

```text
.
|-- backend
|   |-- prisma
|   |   `-- schema.prisma
|   `-- src
|       |-- config
|       |-- controllers
|       |-- db
|       |-- middleware
|       |-- routes
|       |-- services
|       |-- types
|       `-- validation
|-- frontend
|   `-- src
|       |-- api
|       |-- components
|       |-- pages
|       `-- types
`-- README.md
```

## Useful Commands

Backend:

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run prisma:generate
npm run prisma:deploy
```

Frontend:

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Assessment Checklist

- [x] Landing page and lead form
- [x] Basic validation
- [x] CRM dashboard
- [x] Lead detail page
- [x] Editable status, notes, owner, and follow-up date
- [x] AI qualification output
- [x] Automatic acknowledgement email
- [x] Search and filter
- [x] Dashboard chart and activity timeline
- [x] PostgreSQL database schema
- [x] Render backend deployment
- [x] Vercel frontend deployment
- [ ] Add final frontend URL
- [ ] Add public GitHub repository URL
- [ ] Add demo video URL
