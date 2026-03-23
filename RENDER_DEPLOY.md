# Awadhut Banquets & Catering - Render Deployment Guide

## Architecture on Render
- **Backend**: Web Service (Python/FastAPI)
- **Frontend**: Static Site (React build)

---

## Step 1: Push Code to GitHub

First, create a GitHub repo and push the code:

```bash
# In project root
git init
git add .
git commit -m "Initial commit - Awadhut Banquets"
git remote add origin https://github.com/YOUR_USERNAME/awadhut-banquets.git
git push -u origin main
```

---

## Step 2: Deploy Backend on Render

1. Go to https://render.com → **New** → **Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Name**: `awadhut-banquets-api`
   - **Root Directory**: `backend`
   - **Runtime**: Python
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
   
4. Add **Environment Variables**:
   ```
   MONGO_URL=mongodb+srv://chaitanyabanquetsmh24_db_user:JueY4xYiZEHqYVvp@cluster0.dg5ihzv.mongodb.net/?appName=Cluster0
   DB_NAME=awadhut_banquets
   JWT_SECRET=awadhut-banquets-jwt-secret-key-2024-prod
   CLOUDINARY_CLOUD_NAME=djivzwgi0
   CLOUDINARY_API_KEY=474285693915995
   CLOUDINARY_API_SECRET=HXSmdY20tuqwwNcdXNKLa9iI9kA
   CORS_ORIGINS=*
   ```

5. Click **Create Web Service**

Note: After deploying, copy your backend URL (e.g., `https://awadhut-banquets-api.onrender.com`)

---

## Step 3: Deploy Frontend on Render

1. Go to Render → **New** → **Static Site**
2. Connect same GitHub repo
3. Configure:
   - **Name**: `awadhut-banquets`
   - **Root Directory**: `frontend`
   - **Build Command**: `yarn install && yarn build`
   - **Publish Directory**: `build`

4. Add **Environment Variables**:
   ```
   REACT_APP_BACKEND_URL=https://awadhut-banquets-api.onrender.com
   ```
   (Replace with your actual backend URL from Step 2)

5. Add **Redirect/Rewrite Rule** for SPA routing:
   - Source: `/*`
   - Destination: `/index.html`
   - Status: `200`

6. Click **Create Static Site**

---

## Step 4: Verify Deployment

1. Visit your frontend URL
2. Test admin login: `chaitanyabanquetsmh24@gmail.com` / `Soham@123123`
3. Seed data: Visit `https://YOUR_BACKEND_URL/api/seed` (POST request)

---

## Important Notes

- **Free Tier**: Backend may spin down after 15 min of inactivity (cold starts ~30s)
- **Paid Plan** ($7/mo): Keeps backend always on (recommended for production)
- **Custom Domain**: Add your domain in Render settings
- **SSL**: Render provides free SSL automatically
