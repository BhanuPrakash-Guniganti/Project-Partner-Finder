# Deployment Guide — Project Partner Finder

This guide provides step-by-step instructions to deploy **Project Partner Finder** (React Frontend + Express Backend + MongoDB + Groq AI).

---

## Recommended Deployment Strategy

1. **Database**: **MongoDB Atlas** (Free M0 Cluster)
2. **Backend API & WebSockets**: **Render** or **Railway** (Free Node.js web service for persistent Socket.IO chat)
3. **Frontend Application**: **Vercel** (Global CDN for React Vite)

---

## Step 1: Prepare MongoDB Atlas Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in.
2. Under **Database**, click **Connect** on your cluster.
3. Go to **Network Access** -> Click **Add IP Address** -> Select **Allow Access from Anywhere (`0.0.0.0/0`)** (Required for Vercel/Render).
4. Copy your MongoDB Connection String:
   `mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/project_partner_finder?retryWrites=true&w=majority`

---

## Step 2: Deploy Backend to Render (For Persistent Socket.IO Real-Time Chat)

1. Push your repository to **GitHub**.
2. Log in to [Render.com](https://render.com) and click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Set the following configuration:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Under **Environment Variables**, add:
   - `PORT`: `5000`
   - `MONGODB_URI`: *Your MongoDB Atlas connection string*
   - `JWT_SECRET`: *Your secret JWT key*
   - `GROK_API_KEY`: `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`
   - `CLIENT_URL`: *Your Vercel URL (e.g. https://your-app.vercel.app)*
6. Click **Deploy Web Service**.
7. Copy your backend URL (e.g. `https://project-partner-finder-api.onrender.com`).

---

## Step 3: Deploy Frontend to Vercel

1. Log in to [Vercel.com](https://vercel.com) and click **Add New** -> **Project**.
2. Select your GitHub repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Deploy!

### Updating Frontend API Proxy
In `client/vite.config.js` or `client/src/services/api.js`, update the baseURL to point to your deployed backend URL on Render, or set `VITE_API_URL` environment variable on Vercel:

```javascript
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});
```

---

## Alternative: Full Vercel Deployment (Monorepo setup)

If you prefer to deploy both frontend and backend on Vercel:

1. Import your root repository into Vercel.
2. Deploy the `client` directory as Vercel Project 1.
3. Deploy the `server` directory as Vercel Project 2 (using `server/vercel.json`).
4. Set `GROK_API_KEY` and `MONGODB_URI` environment variables in Vercel project settings.
