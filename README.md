<div align="center">
  <h1>✨ OYMO Laser Tracker</h1>
  <p><strong>A comprehensive SaaS platform for tracking laser hair-removal sessions.</strong></p>

  ![Next.js](https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
  ![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
</div>

---

## 📖 Overview

OYMO is a fully-featured, RTL (Right-to-Left) Arabic SaaS web application built to help clients and clinics track laser hair-removal journeys. The standard journey spans 28 sessions. 

The application serves two primary user types:
1. **End-Users (Clients):** Can log in, set up their preferred schedules, upload "before" and "session" progress photos, and track their journey.
2. **Administrators:** Have access to a powerful CRM/Dashboard to manage users, sessions, application text (CMS), audit logs, and more.

<!-- screenshot here -->

## ✨ Features

### User Experience
- **Saudi Phone Login:** Secure login using Saudi phone number format and password.
- **Profile Setup:** Users can configure their first session date and preferred time, generating a full timeline.
- **Auto-Schedule Generation:** Automatically calculates and schedules 28 sessions based on intervals.
- **Session Tracking:** Users can upload progress photos and mark sessions as complete (unlocked only on/after the scheduled day).
- **Progress Dashboard:** Visual journey with dynamic motivational messages and progress indicators.

### Admin Experience
- **User Management:** Create, view, block, or delete clients.
- **Session Control:** View client sessions, override completions, reset schedules, or recalculate dates.
- **Dynamic CMS:** Edit *every single text string* in the app directly from the admin panel (no code changes required).
- **Audit Logging:** Tracks every action taken by any admin.
- **Cloud Storage:** Native integration with Backblaze B2 (S3-compatible) for secure, scalable photo storage.

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| **Framework** | Next.js 14 (App Router) | Full-stack React framework for SSR and API routes. |
| **Language** | TypeScript | Type-safe code across the stack. |
| **Database** | PostgreSQL (Neon) | Relational database. |
| **ORM** | Prisma | Database modeling, migrations, and querying. |
| **Styling** | Tailwind CSS & shadcn/ui | Premium dark-themed, responsive UI. |
| **Storage** | Backblaze B2 (AWS S3 SDK) | Secure cloud storage for user progress photos. |
| **Auth** | Custom JWT (jose) | Secure httpOnly cookies for both Users and Admins. |

## 📁 Project Structure

```text
oymo/
├── app/
│   ├── admin/             # Admin Dashboard pages and layouts
│   ├── api/               # Next.js API Routes (user, admin, auth)
│   ├── dashboard/         # End-user progress dashboard
│   ├── login/             # User login page
│   ├── setup/             # Initial profile setup for new users
│   ├── signup/            # User registration page
│   ├── globals.css        # Tailwind directives and CSS variables
│   └── layout.tsx         # Root layout (handles maintenance mode)
├── components/            # Reusable UI components
├── docs/                  # Detailed project documentation
├── lib/                   # Utility functions
│   ├── auth/              # JWT signing and verification logic
│   ├── prisma.ts          # Prisma client instantiation
│   ├── rateLimit.ts       # In-memory rate limiting mechanism
│   ├── sessions.ts        # Logic for generating session dates
│   ├── settings.ts        # Cached CMS fetching logic
│   └── upload.ts          # Backblaze B2 upload logic
├── prisma/
│   ├── schema.prisma      # Database schema (Models)
│   └── seed.ts            # Default data (Super admin, CMS keys)
└── public/                # Static assets and local upload fallback
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (e.g., Neon.tech)
- Backblaze B2 Account (Optional, falls back to local storage)

### Step-by-Step Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd oymo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env.local` file (copy from `.env` if available) and fill in the values:
   ```bash
   cp .env.example .env.local
   ```

4. **Database Setup**
   Push the Prisma schema to your database and seed the default data:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. **Run the Development Server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## ⚙️ Environment Variables

| Variable | Description | Example |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_USER_SECRET` | Secret key for signing user tokens | `random-64-char-string` |
| `JWT_ADMIN_SECRET` | Secret key for signing admin tokens | `random-64-char-string` |
| `JWT_EXPIRES_IN` | Token expiration time | `30d` |
| `B2_ENDPOINT` | Backblaze B2 S3 Endpoint | `https://s3.us-east-005.backblazeb2.com` |
| `B2_REGION` | Backblaze Region | `us-east-005` |
| `B2_BUCKET_NAME` | Public bucket name | `oymo-photos` |
| `B2_ACCESS_KEY_ID` | B2 Application Key ID | `00507fa442524...` |
| `B2_SECRET_ACCESS_KEY` | B2 Application Secret | `K005vgNYgPSTL...` |

## 🔑 Default Credentials

After running `npx prisma db seed`, a default super-admin account is created:
- **Phone:** `0500000000`
- **Password:** `Admin123!`

*Please change this password immediately in a production environment.*

## 📜 Available Scripts

| Script | Command | Description |
| --- | --- | --- |
| `dev` | `next dev` | Starts the development server |
| `build` | `next build` | Builds the app for production |
| `start` | `next start` | Starts the production server |
| `lint` | `next lint` | Runs ESLint |
