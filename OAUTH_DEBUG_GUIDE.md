# 🔍 Google OAuth Debug Guide

## Overview
This guide helps debug Google OAuth refresh token issues by bypassing Passport.js and testing Google's endpoints directly.

## 🚀 Quick Start

### 1. Start Your Backend
```bash
cd backend
npm run start:dev
```

### 2. Test Backend Debug Endpoints

#### Get Detailed OAuth URL
```
GET http://localhost:3001/auth/debug/oauth-url-detailed
```
This shows your exact OAuth configuration and generates the authorization URL.

#### Test Raw Token Exchange
```
POST http://localhost:3001/auth/debug/test-raw-token-exchange
Content-Type: application/json

{
  "code": "YOUR_AUTHORIZATION_CODE"
}
```

#### Manual Token Exchange
```
GET http://localhost:3001/auth/debug/manual-token-exchange?code=YOUR_AUTHORIZATION_CODE
```

### 3. Use the Direct Test Script
```bash
# Set environment variables
export GOOGLE_CLIENT_ID="your_client_id"
export GOOGLE_CLIENT_SECRET="your_client_secret"
export GOOGLE_CALLBACK_URL="your_callback_url"

# Run the test
node test-oauth.js YOUR_AUTHORIZATION_CODE
```

## 🔧 Step-by-Step Debugging

### Step 1: Verify Environment Variables
Check that these are set correctly:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET` 
- `GOOGLE_CALLBACK_URL`

### Step 2: Test OAuth URL Generation
1. Visit `/auth/debug/oauth-url-detailed`
2. Copy the generated OAuth URL
3. Open it in a browser
4. Complete the Google OAuth flow
5. Copy the `code` parameter from the callback URL

### Step 3: Test Direct Token Exchange
1. Use the `code` from Step 2
2. Test with `/auth/debug/test-raw-token-exchange`
3. Check the response for refresh token presence

### Step 4: Analyze Results
- **✅ Has refresh token**: OAuth flow working correctly
- **❌ No refresh token**: Check Google Cloud Console settings

## 🐛 Common Issues & Solutions

### Issue: No Refresh Token
**Symptoms**: Access token received, but no refresh token
**Solutions**:
1. Check Google Cloud Console OAuth consent screen
2. Ensure "Offline access" is enabled
3. Verify `access_type=offline` in OAuth URL
4. Check `prompt=consent` parameter

### Issue: Invalid Grant
**Symptoms**: `invalid_grant` error
**Solutions**:
1. Authorization code expired (codes expire quickly)
2. Code already used
3. Redirect URI mismatch

### Issue: Redirect URI Mismatch
**Symptoms**: `redirect_uri_mismatch` error
**Solutions**:
1. Check exact redirect URI in Google Cloud Console
2. Ensure no trailing slashes or protocol mismatches
3. Verify callback URL matches exactly

## 🔍 Debug Endpoints Reference

### Backend Debug Endpoints
- `GET /auth/debug/oauth-url-detailed` - Generate OAuth URL with parameters
- `POST /auth/debug/test-raw-token-exchange` - Test direct token exchange
- `GET /auth/debug/manual-token-exchange` - Manual token exchange via service

### Frontend Debug Components
- OAuth Debug Panel (`/debug/oauth-debug-panel`)
- Token Debug Component (`/debug/oauth-token-debug`)

## 📊 Expected Responses

### Successful Token Exchange
```json
{
  "success": true,
  "status": 200,
  "tokenResponse": {
    "access_token": "ya29.a0...",
    "refresh_token": "1//04...",
    "expires_in": 3599,
    "token_type": "Bearer",
    "scope": "profile email https://www.googleapis.com/auth/business.manage"
  },
  "analysis": {
    "hasRefreshToken": true,
    "refreshTokenLength": 120,
    "accessTokenLength": 150,
    "expiresIn": 3599,
    "tokenType": "Bearer",
    "scope": "profile email https://www.googleapis.com/auth/business.manage",
    "idToken": true
  }
}
```

### Failed Token Exchange
```json
{
  "success": false,
  "error": "Google OAuth error",
  "status": 400,
  "googleError": {
    "error": "invalid_grant",
    "error_description": "Bad Request"
  }
}
```

## 🎯 Testing Checklist

- [ ] Environment variables set correctly
- [ ] OAuth URL generates without errors
- [ ] Google OAuth flow completes successfully
- [ ] Authorization code copied from callback
- [ ] Direct token exchange test runs
- [ ] Response contains refresh token
- [ ] Backend can store refresh token
- [ ] Business profile API calls work

## 🚨 Emergency Debugging

If all else fails:

1. **Check Google Cloud Console**:
   - OAuth consent screen settings
   - OAuth 2.0 client IDs
   - Authorized redirect URIs

2. **Verify Scopes**:
   - `profile`
   - `email` 
   - `https://www.googleapis.com/auth/business.manage`

3. **Test with Postman/Insomnia**:
   - Use the raw endpoints directly
   - Bypass your application entirely

4. **Check Network Tab**:
   - Monitor actual HTTP requests
   - Verify request/response headers

## 📞 Getting Help

When reporting issues, include:
- Backend debug endpoint responses
- Direct test script output
- Google Cloud Console screenshots
- Network tab logs
- Environment variable values (masked)

This systematic approach will help identify whether the issue is in your implementation, Google's OAuth server, or configuration settings.
