# 🚀 Railway Deployment Guide

## 📋 **Prerequisites**
- Railway account (https://railway.app)
- GitHub repository with your code
- Supabase project
- Google OAuth credentials
- Facebook OAuth credentials

## 🔧 **Step 1: Connect GitHub Repository**

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository: `goscha01/self-post`
5. Select the `master` branch

## 🔑 **Step 2: Set Environment Variables**

**CRITICAL: You MUST set these environment variables in Railway dashboard before deployment!**

### **Required Environment Variables:**

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_DATABASE_URL=your_supabase_database_url

# JWT Configuration (CRITICAL - Change this!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-app-name.railway.app/auth/google/oauth/callback
GOOGLE_API_KEY=your_google_api_key

# Facebook OAuth Configuration
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=https://your-app-name.railway.app/auth/facebook/oauth/callback

# App Configuration
PORT=3001
NODE_ENV=production
```

## ⚠️ **IMPORTANT: Update Callback URLs**

After deployment, you'll get a Railway URL like: `https://your-app-name.railway.app`

**Update these URLs in Railway environment variables:**
- `GOOGLE_CALLBACK_URL=https://your-app-name.railway.app/auth/google/oauth/callback`
- `FACEBOOK_CALLBACK_URL=https://your-app-name.railway.app/auth/facebook/oauth/callback`

**Update these URLs in Google Cloud Console:**
- Add `https://your-app-name.railway.app/auth/google/oauth/callback` to authorized redirect URIs

**Update these URLs in Facebook App:**
- Add `https://your-app-name.railway.app/auth/facebook/oauth/callback` to Valid OAuth Redirect URIs

## 🚀 **Step 3: Deploy**

1. Railway will automatically detect the Dockerfile
2. Build will start automatically
3. Monitor the build logs for any errors
4. Once successful, your app will be live!

## 🔍 **Step 4: Verify Deployment**

1. Check the Railway dashboard for your app URL
2. Test the health endpoint: `https://your-app-name.railway.app/health`
3. Test Google OAuth: `https://your-app-name.railway.app/auth/google`
4. Test Facebook OAuth: `https://your-app-name.railway.app/auth/facebook`

## 🐛 **Troubleshooting**

### **Common Issues:**

1. **JWT_SECRET missing**: Ensure `JWT_SECRET` is set in Railway environment variables
2. **Build fails**: Check build logs for TypeScript/ESLint errors
3. **OAuth redirect errors**: Verify callback URLs match exactly
4. **Database connection**: Ensure Supabase credentials are correct

### **Debug Commands:**

```bash
# Check Railway logs
railway logs

# Check environment variables
railway variables

# Restart deployment
railway up
```

## 📱 **After Successful Deployment**

1. **Get your live URL** from Railway dashboard
2. **Update Facebook App** with production callback URL
3. **Update Google Cloud Console** with production callback URL
4. **Test the complete integration** with real OAuth flows

## 🔒 **Security Notes**

- Change `JWT_SECRET` to a strong, unique value
- Never commit real secrets to Git
- Use Railway's environment variable encryption
- Regularly rotate API keys and secrets

---

**Need Help?** Check Railway documentation or create an issue in your GitHub repository.
