# Architecture Overview

## 1. System Overview
OYMO is built on the Next.js 14 App Router architecture, leveraging React Server Components (RSC) and Client Components. 
The system operates securely by validating users and routing requests based on roles.

### Request Lifecycle
1. **User requests a page:** The request hits `middleware.ts`.
2. **Middleware Evaluation:** Checks if the route requires authentication (e.g., `/admin/*` requires `oymo_admin_token`, `/dashboard` requires `oymo_user_token`). If authorized, it passes headers (like `x-pathname`) down.
3. **Layout & Maintenance Check:** The root `app/layout.tsx` checks the database (via a cached Promise) to see if maintenance mode is active. If so, it redirects to `/maintenance`.
4. **Server Component Rendering:** Next.js fetches data securely on the server using Prisma. No sensitive data or database secrets leak to the client.
5. **Client Hydration:** Interactive elements (Client Components) handle forms, uploads, and UI state.

## 2. Authentication Flow
The application uses stateless JWTs stored in `httpOnly` cookies, avoiding database session lookups on every request.

- **User Auth:** Phone & Password → Verified against `User` table → `signUserToken()` → Sets `oymo_user_token` cookie.
- **Admin Auth:** Phone & Password → Verified against `Admin` table → `signAdminToken()` → Sets `oymo_admin_token` cookie.
- **Middleware:** Parses cookies. If an unauthenticated user tries to access `/dashboard`, they are redirected to `/login`. Admin routes redirect to `/admin/login`.
- **JWT Payload:** Contains `{ userId: string, type: 'user' }` or `{ adminId: string, role: string, type: 'admin' }`.

## 3. Database Architecture
The PostgreSQL database consists of 6 core models:

1. **User:** Represents the end client. Has a unique phone number and hashed password.
2. **Profile:** Extends the User model (1-to-1). Created during the `/setup` flow. Stores `firstSessionDate` and `preferredTime`.
3. **Session:** Belongs to a Profile (1-to-many). Represents one of the 28 laser sessions.
4. **Admin:** Represents a dashboard administrator. Has a role (`admin` or `super_admin`).
5. **AppSettings:** Key-value store for the dynamic CMS.
6. **AuditLog:** Tracks actions taken by Admins for accountability.

*Key Decisions:* 
- `cuid()` is used for primary keys to prevent enumeration attacks.
- `onDelete: Cascade` ensures deleting a User automatically deletes their Profile and Sessions.

## 4. Settings (CMS) System
Almost all text in the app is dynamic and stored in the `AppSettings` table.

- **Caching Mechanism:** `lib/settings.ts` fetches settings from the database and caches them in memory (`let cachePromise`) for 60 seconds. This prevents "cache stampedes" where multiple concurrent requests hammer the database.
- **Adding a Setting:** Add the key and default value to `prisma/seed.ts` and run `npx prisma db seed`. It will appear in the Admin Panel automatically.
- **Usage:** Settings are retrieved via `getSettings()`, `getSettingBool()`, or `getSettingNumber()`.

## 5. File Storage (Backblaze B2)
Photos are uploaded directly to Backblaze B2 (an S3-compatible object storage service).

1. **Client:** Selects a photo and submits the form.
2. **API Route:** `lib/upload.ts` receives the File buffer.
3. **Upload:** Uses `@aws-sdk/client-s3` `PutObjectCommand` to send the file to the B2 bucket.
4. **Validation:** Checks MIME type (JPEG/PNG/WEBP) and size (Max 5MB).
5. **Database:** Saves the generated public URL string in the `Session` or `Profile` record.

## 6. Session Generation Logic
Located in `lib/sessions.ts`, the `generateSessions` function is triggered during profile setup or when an admin forces a recalculation.

- **Variables:** Reads `total_sessions` (default 28) and `session_interval_weeks` (default 4) from the CMS.
- **Formula:** Loop N from 0 to 27. 
  `Session_N_Date = firstSessionDate + (N * interval_weeks * 7 days)`.
- It saves all 28 sessions into the database with `scheduledAt` set to the calculated date.

## 7. Audit Logging
Every write action performed by an admin is logged.

- **Structure:** Records `adminId`, `action` string, `targetUserId` (optional), and `details` (JSON payload of what changed).
- **Actions Logged:** `update_user`, `delete_user`, `block_user`, `unblock_user`, `reset_sessions`, `recalc_sessions`, `complete_session`, `reset_session`, `upload_session_photo`, `update_session`, `change_setting`.
