# Deployment Guide

This guide explains how to deploy OYMO to production using Neon (Database), Backblaze B2 (Storage), and Vercel (Hosting).

## 1. Prerequisites Checklist
- [ ] GitHub account with the OYMO repository.
- [ ] Neon.tech account for PostgreSQL.
- [ ] Backblaze account for B2 Storage.
- [ ] Vercel account for Hosting.

## 2. Database Setup (Neon PostgreSQL)
1. Go to [Neon.tech](https://neon.tech) and create a new project.
2. Under the "Dashboard", copy the **Connection String** (Ensure "Pooled connection" is checked).
3. Locally, paste this into your `.env` file as `DATABASE_URL`.
4. Run the database migrations and seed data locally to ensure the DB is ready:
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

## 3. Storage Setup (Backblaze B2)
1. Create a Backblaze account.
2. Go to **Buckets** → **Create a Bucket**.
   - **Name:** `oymo-photos` (must be globally unique).
   - **Files in Bucket are:** Public.
3. Once created, note the **Endpoint** (e.g., `s3.us-east-005.backblazeb2.com`).
4. Go to **App Keys** → **Add a New Application Key**.
   - **Key Name:** `oymo-app-key`
   - **Allow access to Bucket:** Select your new bucket.
   - **Type of Access:** Read and Write.
5. Copy the `keyID` (`B2_ACCESS_KEY_ID`) and `applicationKey` (`B2_SECRET_ACCESS_KEY`). *You will not see the secret key again.*
6. **CORS Setup (Important):**
   By default, B2 blocks cross-origin requests. You must configure CORS using the B2 CLI or B2 Web Interface to allow `GET` and `PUT` from your domain.

## 4. Hosting Setup (Vercel)
1. Log in to [Vercel](https://vercel.com) and click **Add New...** → **Project**.
2. Import your OYMO repository from GitHub.
3. In the **Environment Variables** section, add the following exact keys:

| Key | Value |
| --- | --- |
| `DATABASE_URL` | Your Neon pooled connection string |
| `JWT_USER_SECRET` | A secure random 64-char string |
| `JWT_ADMIN_SECRET` | A secure random 64-char string |
| `JWT_EXPIRES_IN` | `30d` |
| `B2_ENDPOINT` | e.g. `https://s3.us-east-005.backblazeb2.com` |
| `B2_REGION` | e.g. `us-east-005` |
| `B2_BUCKET_NAME` | Your bucket name |
| `B2_ACCESS_KEY_ID` | Your Backblaze Key ID |
| `B2_SECRET_ACCESS_KEY`| Your Backblaze Secret Key |
| `NEXT_PUBLIC_APP_URL` | e.g. `https://oymo.app` |

4. Click **Deploy**. Vercel will automatically run `npm run build`.

## 5. Alternative VPS Deployment (PM2 / Nginx)
If you prefer a traditional VPS (Ubuntu/Debian):

1. Clone repo, install Node 18+.
2. `npm install`
3. Setup `.env` file.
4. `npx prisma generate && npx prisma db push`
5. `npm run build`
6. Start using PM2:
   ```bash
   npm install -g pm2
   pm2 start npm --name "oymo" -- start
   pm2 save
   pm2 startup
   ```
7. Configure Nginx as a reverse proxy:
   ```nginx
   server {
       listen 80;
       server_name oymo.app;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 6. Post-Deployment Checklist
- [ ] Go to `https://your-domain.com/admin/login`.
- [ ] Log in using `0500000000` and `Admin123!`.
- [ ] Go to **CMS Settings** and change the Default Password minimum length if needed.
- [ ] Change the Super Admin password immediately from the Profile tab.
- [ ] Create a test user account and upload a photo to ensure B2 integration works perfectly.
