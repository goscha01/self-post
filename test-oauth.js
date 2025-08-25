#!/usr/bin/env node

/**
 * Direct Google OAuth Test Script
 * This bypasses Passport.js to test Google's token endpoint directly
 */

const https = require('https');
const querystring = require('querystring');

// Configuration - Update these values
const config = {
  clientId: process.env.GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET',
  redirectUri: process.env.GOOGLE_CALLBACK_URL || 'YOUR_REDIRECT_URI',
  authorizationCode: process.argv[2] || 'AUTHORIZATION_CODE_HERE'
};

console.log('🔍 Google OAuth Direct Test');
console.log('============================');
console.log(`Client ID: ${config.clientId}`);
console.log(`Redirect URI: ${config.redirectUri}`);
console.log(`Auth Code: ${config.authorizationCode.substring(0, 20)}...`);
console.log('');

if (!config.authorizationCode || config.authorizationCode === 'AUTHORIZATION_CODE_HERE') {
  console.log('❌ Please provide an authorization code as an argument:');
  console.log('   node test-oauth.js YOUR_AUTH_CODE');
  console.log('');
  console.log('💡 To get an auth code:');
  console.log('   1. Visit the OAuth URL from your backend debug endpoint');
  console.log('   2. Complete the Google OAuth flow');
  console.log('   3. Copy the "code" parameter from the callback URL');
  process.exit(1);
}

// Test 1: Generate OAuth URL
function generateOAuthUrl() {
  const scopes = [
    'profile',
    'email',
    'https://www.googleapis.com/auth/business.manage'
  ];

  const params = {
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: scopes.join(' '),
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'false'
  };

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${querystring.stringify(params)}`;
  
  console.log('🔗 Generated OAuth URL:');
  console.log(authUrl);
  console.log('');
  console.log('📋 OAuth Parameters:');
  console.log(JSON.stringify(params, null, 2));
  console.log('');
}

// Test 2: Direct token exchange
function testTokenExchange() {
  console.log('🔄 Testing direct token exchange...');
  
  const postData = querystring.stringify({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code: config.authorizationCode,
    grant_type: 'authorization_code',
    redirect_uri: config.redirectUri
  });

  const options = {
    hostname: 'oauth2.googleapis.com',
    port: 443,
    path: '/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(options, (res) => {
    console.log(`📡 Response Status: ${res.statusCode}`);
    console.log(`📊 Response Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📄 Response Body: ${data}`);
      
      try {
        const response = JSON.parse(data);
        
        if (res.statusCode === 200) {
          console.log('');
          console.log('✅ Token Exchange Successful!');
          console.log('============================');
          console.log(`Access Token: ${response.access_token ? '✅ Present' : '❌ Missing'}`);
          console.log(`Refresh Token: ${response.refresh_token ? '✅ Present' : '❌ Missing'}`);
          console.log(`Expires In: ${response.expires_in || 'N/A'} seconds`);
          console.log(`Token Type: ${response.token_type || 'N/A'}`);
          console.log(`Scope: ${response.scope || 'N/A'}`);
          
          if (response.refresh_token) {
            console.log(`Refresh Token Length: ${response.refresh_token.length} characters`);
          }
          
          console.log('');
          console.log('🔍 Analysis:');
          if (response.refresh_token) {
            console.log('✅ Refresh token received - OAuth flow working correctly');
          } else {
            console.log('❌ No refresh token - Check OAuth consent screen settings');
            console.log('💡 Make sure "Offline access" is enabled in Google Cloud Console');
          }
        } else {
          console.log('');
          console.log('❌ Token Exchange Failed');
          console.log('=======================');
          console.log(`Error: ${response.error || 'Unknown error'}`);
          console.log(`Description: ${response.error_description || 'No description'}`);
          
          if (response.error === 'invalid_grant') {
            console.log('💡 This usually means the authorization code has expired or was already used');
          } else if (response.error === 'redirect_uri_mismatch') {
            console.log('💡 Check that your redirect URI matches exactly in Google Cloud Console');
          }
        }
      } catch (e) {
        console.log('❌ Failed to parse response as JSON');
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Request error:', e.message);
  });

  req.write(postData);
  req.end();
}

// Run tests
console.log('🧪 Running OAuth Tests...\n');

generateOAuthUrl();
testTokenExchange();
