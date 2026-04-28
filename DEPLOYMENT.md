# Vercel Deployment Guide

## Quick Deploy

```bash
# Install Vercel CLI if you haven't already
npm i -g vercel

# Deploy to Vercel
vercel
```

## How it works

- **Frontend**: Static files served from `/public` directory
- **Backend API**: Express app runs as serverless functions at `/api/*` endpoints
- **Data Storage**: 
  - **Local**: Uses `backend/data/projects.json`
  - **Vercel**: Uses in-memory storage (⚠️ data will reset on each deployment)

## Important Notes

⚠️ **Data Persistence on Vercel**

The current setup uses in-memory storage on Vercel, which means:
- Data will be lost when the function "cold starts" (becomes inactive)
- Data will be lost on new deployments
- This is fine for demos and testing but NOT for production

### To make data persistent, you need to use a database:

**Recommended options:**
1. **Vercel Postgres** (easiest integration)
2. **Vercel KV** (Redis-based key-value store)
3. **MongoDB Atlas**
4. **Supabase**

Run `/vercel:marketplace` to explore database options.

## File Structure for Vercel

```
/
├── backend/
│   ├── api/
│   │   └── index.js          # Vercel function entry point
│   └── server.js              # Express app (works locally and on Vercel)
├── public/                    # Static files served by Vercel
│   ├── index.html
│   ├── css/
│   └── js/
├── vercel.json               # Vercel configuration
└── package.json
```

## Troubleshooting

### 404 Errors
- Make sure `vercel.json` exists
- Check that API routes start with `/api/`
- Verify `backend/api/index.js` exports the Express app

### API Not Working
- Check function logs with `vercel logs`
- Verify CORS settings in `backend/server.js`
- Make sure frontend is calling `/api/projects` not `http://localhost:3000/api/projects`
