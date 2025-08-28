# Deployment Guide

This guide explains how to deploy the backend to Railway and frontend to Vercel from the same monorepo.

## Backend Deployment to Railway

### 1. Railway Setup
1. Go to [Railway.app](https://railway.app) and create a new project
2. Connect your GitHub repository
3. Railway will automatically detect the `railway.json` configuration

### 2. Environment Variables
Set these environment variables in Railway:
- Database connection strings
- JWT secrets
- OAuth credentials
- Any other backend-specific environment variables
- **Important**: Set `CORS_ORIGIN` to your Vercel frontend domain

### 3. Deployment
Railway will automatically:
- Use the `nixpacks.toml` configuration
- Build the backend from the `backend/` directory
- Run `npm run start:prod` to start the application
- Deploy to Railway's infrastructure

**Note**: Railway uses `nixpacks.toml`, not the Dockerfile. The Dockerfile is kept for local development or alternative deployment methods.

## Frontend Deployment to Vercel

### 1. Vercel Setup
1. Go to [Vercel.com](https://vercel.com) and create a new project
2. Connect your GitHub repository
3. Set the **Root Directory** to `frontend`
4. Vercel will automatically detect the `vercel.json` configuration

### 2. Environment Variables
Set these environment variables in Vercel:
- `NEXT_PUBLIC_API_URL`: Your Railway backend URL (e.g., `https://your-app.railway.app`)
- Any other frontend-specific environment variables

### 3. Deployment
Vercel will automatically:
- Install dependencies with `npm ci`
- Build the project with `npm run build`
- Deploy the `.next` output directory
- Handle routing and API proxying

## Configuration Files

### Railway Configuration (`railway.json`)
- Uses Nixpacks builder for better Node.js support
- Starts the backend with `npm run start:prod`
- Configured to only deploy backend files

### Nixpacks Configuration (`nixpacks.toml`)
- Installs Node.js 20 and npm
- Installs backend dependencies
- Builds the backend
- Starts the production server

### Vercel Configuration (`frontend/vercel.json`)
- Specifies build and install commands
- Sets output directory to `.next`
- Configures security headers
- Sets up API routing

### Dockerfile
- **Updated**: Now only handles backend deployment
- **Railway**: Uses `nixpacks.toml` instead of Dockerfile
- **Local**: Can still be used for local Docker development

### Ignore Files
- `.railwayignore`: Excludes frontend files from Railway
- `frontend/.vercelignore`: Excludes backend files from Vercel

## Deployment Commands

### Local Development
```bash
# Install all dependencies
npm run install:all

# Build both projects
npm run build

# Start backend only
npm start

# Start frontend only
cd frontend && npm run dev
```

### Railway Deployment
```bash
# Railway automatically deploys when you push to main branch
git push origin main
```

### Vercel Deployment
```bash
# Vercel automatically deploys when you push to main branch
git push origin main
```

## Environment Variables

### Backend (Railway)
```env
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CORS_ORIGIN=https://your-vercel-frontend.vercel.app
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app
```

## Important Notes

1. **Separate Deployments**: Backend and frontend are deployed independently
2. **CORS Configuration**: Ensure your backend allows requests from your Vercel frontend domain
3. **Environment Variables**: Set them in both Railway and Vercel dashboards
4. **Domain Configuration**: Configure custom domains in both platforms if needed
5. **SSL**: Both platforms provide automatic SSL certificates
6. **Dockerfile**: Updated to only handle backend (Railway uses nixpacks)

## Troubleshooting

### Railway Issues
- Check build logs in Railway dashboard
- Verify environment variables are set correctly
- Ensure backend dependencies are properly installed
- Check that `CORS_ORIGIN` is set to your Vercel domain

### Vercel Issues
- Check build logs in Vercel dashboard
- Verify the root directory is set to `frontend`
- Ensure frontend dependencies are properly installed
- Check that `NEXT_PUBLIC_API_URL` points to your Railway backend

### Common Issues
- **CORS errors**: Make sure `CORS_ORIGIN` in Railway matches your Vercel domain
- **API connection**: Verify `NEXT_PUBLIC_API_URL` in Vercel is correct
- **Build failures**: Check that ignore files are properly configured
