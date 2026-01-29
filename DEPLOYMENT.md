# Deployment Guide

This project is set up to be deployed with **Render** (Backend) and **Vercel** (Frontend).

## Prerequisites

1.  Push your code to a GitHub repository.

## Part 1: Deploy Backend to Render

1.  Go to [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  Configure the service:
    *   **Name**: `galaxy-chat-backend` (or similar)
    *   **Region**: Singapore (Singapore) - *Since your Neon DB is in ap-southeast-1, keep it close.*
    *   **Branch**: `main`
    *   **Root Directory**: `.` (Leave empty or dot)
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install && npx prisma generate --schema backend/prisma/schema.prisma`
    *   **Start Command**: `node backend/src/index.js`
5.  **Environment Variables** (Add these):
    *   `DATABASE_URL`: *(Your Neon DB connection string)*
    *   `CLOUDINARY_CLOUD_NAME`: `ddeuqxquc`
    *   `CLOUDINARY_API_KEY`: `656862858245136`
    *   `CLOUDINARY_API_SECRET`: `fvtx6twL49hilAMrKTI_cUyOPcY`
    *   `CLIENT_URL`: `https://<YOUR-VERCEL-APP-NAME>.vercel.app` *(You will update this later after deploying frontend)*
    *   `NODE_ENV`: `production`

6.  Click **Create Web Service**.
    *   *Note: The first deploy might fail if `CLIENT_URL` is strict, but since `app.use(cors())` allows all, the API will work. Socket.IO might block until you update `CLIENT_URL`.*

7.  **Copy your Backend URL** (e.g., `https://galaxy-chat-backend.onrender.com`).

## Part 2: Deploy Frontend to Vercel

1.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  Configure the project:
    *   **Framework Preset**: `Vite`
    *   **Root Directory**: `.` (Root)
    *   **Build Command**: `npm run build` (or `tsc -b && vite build`)
    *   **Output Directory**: `dist`
5.  **Environment Variables**:
    *   `VITE_API_URL`: Paste your **Render Backend URL** here (e.g., `https://galaxy-chat-backend.onrender.com`).
        *   *Important: Do not add a trailing slash `/`.*
6.  Click **Deploy**.

## Part 3: Final Configuration

1.  Once Vercel finishes, copy your **Vercel Deployment Domain** (e.g., `https://galaxy-chat-hub.vercel.app`).
2.  Go back to **Render** -> **Settings** -> **Environment Variables**.
3.  Update (or Add) `CLIENT_URL` with your Vercel domain.
    *   Example: `https://galaxy-chat-hub.vercel.app`
4.  **Save Changes** (Render will redeploy).
5.  Now your Socket.IO connection and CORS settings are fully secure and linked.

## Troubleshooting

*   **Database**: Ensure your Neon DB allows connections from anywhere or specifically from Render IPs (usually unrestricted by default).
*   **Migrations**: If you need to apply migrations on production, you can add a "Pre-Deploy Command" in Render settings or run it as part of the build command:
    `npm install && npx prisma migrate deploy --schema backend/prisma/schema.prisma && npx prisma generate --schema backend/prisma/schema.prisma`
    *   *Note: `migrate deploy` is safer for production than `migrate dev`.*
