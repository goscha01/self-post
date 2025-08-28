import { Controller, UseGuards, Req, Get, Res, Param, Delete, Post, Body, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BusinessProfileService } from './business-profile.service';
import { OAuthDebugService } from './oauth-debug.service';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private businessProfileService: BusinessProfileService,
    private oauthDebugService: OAuthDebugService
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    console.log('🚀 Google OAuth initiated');
    // Guard will handle the OAuth flow
  }

  @Get('google/oauth/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    const startTime = new Date().toISOString();
    const requestId = Math.random().toString(36).substring(7);
    
    console.log(`=== OAUTH CALLBACK DEBUG [${requestId}] [${startTime}] ===`);
    console.log(`🔍 Request ID: ${requestId}`);
    console.log(`⏰ Start Time: ${startTime}`);
    console.log(`📨 Request user keys:`, Object.keys(req.user || {}));
    
    try {
      // Handle OAuth callback and redirect to frontend
      const { accessToken, refreshToken, profile } = req.user;
      
      console.log(`=== TOKEN EXCHANGE RESPONSE [${requestId}] ===`);
      console.log(`📥 Full token data received:`, {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessTokenLength: accessToken?.length || 0,
        refreshTokenLength: refreshToken?.length || 0,
        accessTokenType: typeof accessToken,
        refreshTokenType: typeof refreshToken,
        profileKeys: profile ? Object.keys(profile).length : 0,
        profileId: profile?.id,
        profileEmail: profile?.emails?.[0]?.value
      });
      
      console.log(`=== TOKEN ANALYSIS [${requestId}] ===`);
      console.log(`🔑 Access Token:`, accessToken ? `Present (${accessToken.length} chars)` : 'Missing');
      console.log(`🔄 Refresh Token:`, refreshToken ? `Present (${refreshToken.length} chars)` : 'Missing');
      console.log(`📱 Profile:`, profile ? `Present (${Object.keys(profile).length} keys)` : 'Missing');
      
      if (accessToken) {
        console.log(`🔑 Access Token Preview:`, accessToken.substring(0, 20) + '...');
        console.log(`🔑 Access Token Type:`, typeof accessToken);
      }
      
      if (refreshToken) {
        console.log(`🔄 Refresh Token Preview:`, refreshToken.substring(0, 20) + '...');
        console.log(`🔄 Refresh Token Type:`, typeof refreshToken);
        console.log(`✅ SUCCESS: Refresh token received from Google OAuth!`);
      } else {
        console.log(`❌ CRITICAL: No refresh token received from Google OAuth!`);
        console.log(`❌ This will prevent offline access to Google Business Profile APIs`);
        console.log(`❌ Possible causes:`);
        console.log(`❌ 1. Google OAuth consent screen not configured for offline access`);
        console.log(`❌ 2. User has already granted permissions (no consent screen shown)`);
        console.log(`❌ 3. OAuth flow parameters not being sent correctly`);
        console.log(`❌ 4. Google Cloud Console project settings issue`);
      }
      
      console.log(`=== DATABASE SAVE ATTEMPT [${requestId}] ===`);
      console.log(`👤 User email:`, profile?.emails?.[0]?.value || 'Unknown');
      console.log(`🔑 Access token to save:`, accessToken ? 'PRESENT' : 'MISSING');
      console.log(`🔄 Refresh token to save:`, refreshToken ? 'PRESENT' : 'MISSING');
      console.log(`⏰ Database save start time:`, new Date().toISOString());
      
      // Enhanced database save logging
      console.log(`=== SAVING TO DATABASE [${requestId}] ===`);
      console.log(`💾 Refresh token being saved:`, refreshToken ? 'PRESENT' : 'MISSING');
      console.log(`💾 Access token being saved:`, accessToken ? 'PRESENT' : 'MISSING');
      console.log(`💾 Profile data being saved:`, profile ? `${Object.keys(profile).length} keys` : 'MISSING');
      console.log(`💾 Database save parameters:`, {
        profileId: profile?.id,
        profileEmail: profile?.emails?.[0]?.value,
        accessTokenLength: accessToken?.length || 0,
        refreshTokenLength: refreshToken?.length || 0,
        timestamp: new Date().toISOString()
      });
      
      // Store the OAuth connection in database
      const dbSaveStartTime = Date.now();
      const result = await this.authService.storeGoogleConnection(profile, accessToken, refreshToken);
      const dbSaveDuration = Date.now() - dbSaveStartTime;
      
      console.log(`=== POST-SAVE VERIFICATION [${requestId}] ===`);
      console.log(`💾 Save result:`, result.success ? 'SUCCESS' : 'FAILED');
      console.log(`⏱️ Database save duration:`, dbSaveDuration, 'ms');
      if (!result.success) {
        console.log(`❌ Save error:`, result.error);
      }
      
      if (result.success) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const redirectUrl = `${frontendUrl}/integration/callback?success=true&platform=google&profile_id=${result.profileId}&email=${encodeURIComponent(result.userEmail || '')}`;
        console.log(`🎯 Redirecting to:`, redirectUrl);
        res.redirect(redirectUrl);
      } else {
        const redirectUrl = `http://localhost:3000/integration/callback?success=false&error=${encodeURIComponent(result.error)}`;
        console.log(`❌ Redirecting to error:`, redirectUrl);
        res.redirect(redirectUrl);
      }
    } catch (error) {
      console.error(`❌ Error in Google OAuth callback [${requestId}]:`, error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/integration/callback?success=false&error=${encodeURIComponent('Failed to store connection')}`;
      res.redirect(redirectUrl);
    } finally {
      const endTime = new Date().toISOString();
      console.log(`=== OAUTH CALLBACK COMPLETE [${requestId}] ===`);
      console.log(`⏰ End Time: ${endTime}`);
      console.log(`⏱️ Total Duration: ${new Date(endTime).getTime() - new Date(startTime).getTime()}ms`);
    }
  }

  /**
   * Direct OAuth callback endpoint for debug OAuth flow
   */
  @Get('google/oauth/callback/direct')
  async directGoogleOAuthCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    try {
      console.log('=== DIRECT OAUTH CALLBACK ===');
      console.log('🔑 Authorization code received:', code);
      console.log('🔑 State:', state);
      
      if (!code) {
        console.error('❌ No authorization code received');
        return res.redirect('/integration?error=no_code');
      }
      
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = process.env.GOOGLE_CALLBACK_URL;
      
      if (!clientId || !clientSecret || !redirectUri) {
        console.error('❌ Missing OAuth configuration');
        return res.redirect('/integration?error=config_missing');
      }
      
      // Exchange authorization code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code: code
        }),
      });
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('❌ Token exchange failed:', errorText);
        return res.redirect('/integration?error=token_exchange_failed');
      }
      
      const tokenData = await tokenResponse.json();
      console.log('✅ Token exchange successful');
      console.log('🔑 Access token present:', !!tokenData.access_token);
      console.log('🔄 Refresh token present:', !!tokenData.refresh_token);
      
      if (!tokenData.refresh_token) {
        console.error('❌ No refresh token received');
        return res.redirect('/integration?error=no_refresh_token');
      }
      
      // Get user profile using access token
      const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });
      
      if (!profileResponse.ok) {
        console.error('❌ Failed to get user profile');
        return res.redirect('/integration?error=profile_failed');
      }
      
      const profile = await profileResponse.json();
      console.log('✅ User profile retrieved:', profile.email);
      
      // Store the OAuth connection in database
      const result = await this.authService.storeGoogleConnection(
        profile, 
        tokenData.access_token, 
        tokenData.refresh_token
      );
      
      if (result.success) {
        console.log('✅ OAuth connection stored successfully');
        // Redirect to frontend with success
        return res.redirect('/integration?success=true&platform=google');
      } else {
        console.error('❌ Failed to store OAuth connection');
        return res.redirect('/integration?error=storage_failed');
      }
      
    } catch (error) {
      console.error('❌ Direct OAuth callback error:', error);
      return res.redirect('/integration?error=callback_error');
    }
  }

  @Get('connections/:email')
  async getConnections(@Param('email') email: string) {
    return this.authService.getUserConnections(email);
  }

  @Get('profile/:email')
  async getGoogleProfile(@Param('email') email: string) {
    return this.authService.getGoogleProfile(email);
  }

  @Get('business/:email/:accountName')
  async getBusinessProfile(@Param('email') email: string, @Param('accountName') accountName: string) {
    return this.authService.getBusinessProfileData(email, accountName);
  }

  @Delete('disconnect/:email/:platform')
  async disconnectPlatform(@Param('email') email: string, @Param('platform') platform: string) {
    return this.authService.disconnectPlatform(email, platform);
  }

  // Debug endpoint to check stored tokens
  @Get('debug-tokens/:email')
  async debugTokens(@Param('email') email: string) {
    try {
      const result = await this.authService.getUserConnections(email);
      if ('error' in result) {
        return { success: false, error: result.error };
      }
      
      return { 
        success: true, 
        connections: result.connections.map((conn: any) => ({
          platform: conn.platform,
          hasAccessToken: !!conn.accessToken,
          hasRefreshToken: !!conn.refreshToken,
          accessTokenLength: conn.accessToken?.length || 0,
          refreshTokenLength: conn.refreshToken?.length || 0,
          isActive: conn.isActive,
          createdAt: conn.createdAt
        }))
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Force fresh consent endpoint - clears existing OAuth state
  @Post('force-fresh-consent/:email')
  async forceFreshConsent(@Param('email') email: string) {
    try {
      console.log('🔄 Force fresh consent requested for:', email);
      
      // Clear existing OAuth state to force fresh consent
      const result = await this.authService.clearOAuthState(email);
      
      if (result.success) {
        console.log('✅ OAuth state cleared successfully');
        return {
          success: true,
          message: 'OAuth state cleared. Please reconnect to get fresh permissions.',
          nextStep: 'Go to /integration and reconnect Google account'
        };
      } else {
        console.log('❌ Failed to clear OAuth state:', result.error);
        return result;
      }
    } catch (error: any) {
      console.error('❌ Error in force fresh consent:', error);
      return { success: false, error: error.message };
    }
  }

  // New Business Profile endpoints for agency use
  @Get('business-accounts/:email')
  async getBusinessAccounts(@Param('email') email: string) {
    try {
      const accounts = await this.businessProfileService.getBusinessAccounts(email);
      return { success: true, accounts };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Get('business-profile/:email/:accountName')
  async getBusinessProfileData(@Param('email') email: string, @Param('accountName') accountName: string) {
    try {
      const data = await this.businessProfileService.getBusinessProfileData(email, accountName);
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Get('location/:locationName/:email')
  async getLocationDetails(@Param('locationName') locationName: string, @Param('email') email: string) {
    try {
      const location = await this.businessProfileService.getLocationDetails(locationName, email);
      return { success: true, location };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Post('post/:locationName/:email')
  async createBusinessPost(
    @Param('locationName') locationName: string,
    @Param('email') email: string,
    @Body() postData: any
  ) {
    try {
      const post = await this.businessProfileService.createBusinessPost(locationName, postData, email);
      return { success: true, post };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Post('review/:reviewName/:email/reply')
  async replyToReview(
    @Param('reviewName') reviewName: string,
    @Param('email') email: string,
    @Body() replyData: any
  ) {
    try {
      const reply = await this.businessProfileService.replyToReview(reviewName, replyData, email);
      return { success: true, reply };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Post('location/:locationName/:email/update')
  async updateBusinessInfo(
    @Param('locationName') locationName: string,
    @Param('email') email: string,
    @Body() updateData: any
  ) {
    try {
      const result = await this.businessProfileService.updateBusinessInfo(locationName, updateData, email);
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ===== COMPREHENSIVE OAUTH DEBUG ENDPOINTS =====

  /**
   * Get complete OAuth debugging information
   */
  @Get('debug-google')
  async debugGoogleOAuth() {
    try {
      const debugInfo = this.oauthDebugService.getOAuthDebugInfo();
      return {
        success: true,
        debugInfo
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Test token refresh functionality
   */
  @Post('test-token-refresh')
  async testTokenRefresh(@Body() body: { refreshToken: string }) {
    try {
      const { refreshToken } = body;
      if (!refreshToken) {
        return { success: false, error: 'Refresh token is required' };
      }

      const result = await this.oauthDebugService.testTokenRefresh(refreshToken);
      return {
        success: true,
        result
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Validate environment configuration
   */
  @Get('validate-environment')
  async validateEnvironment() {
    try {
      const validation = this.oauthDebugService.validateEnvironment();
      return {
        success: true,
        validation
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get OAuth authorization URL for manual testing
   */
  @Get('oauth-url')
  async getOAuthUrl() {
    try {
      const debugInfo = this.oauthDebugService.getOAuthDebugInfo();
      return {
        success: true,
        oauthUrl: debugInfo.generatedUrls.authorizationUrl,
        config: debugInfo.oauthConfig
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }



  /**
   * Enhanced token debugging with detailed analysis
   */
  @Get('debug-tokens-enhanced/:email')
  async debugTokensEnhanced(@Param('email') email: string) {
    try {
      const result = await this.authService.getUserConnections(email);
      if ('error' in result) {
        return { success: false, error: result.error };
      }
      
      const enhancedConnections = result.connections.map((conn: any) => {
        const accessToken = conn.accessToken || '';
        const refreshToken = conn.refreshToken || '';
        
        return {
          platform: conn.platform,
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          accessTokenLength: accessToken.length,
          refreshTokenLength: refreshToken.length,
          accessTokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : 'N/A',
          refreshTokenPreview: refreshToken ? `${refreshToken.substring(0, 20)}...` : 'N/A',
          isActive: conn.isActive,
          createdAt: conn.createdAt,
          updatedAt: conn.updatedAt,
          tokenExpiresAt: conn.tokenExpiresAt,
          profileData: conn.profileData,
          analysis: {
            canRefresh: !!refreshToken,
            needsReconnection: !refreshToken && !!accessToken,
            fullyConfigured: !!accessToken && !!refreshToken
          }
        };
      });

      return { 
        success: true, 
        email,
        timestamp: new Date().toISOString(),
        connections: enhancedConnections,
        summary: {
          totalConnections: enhancedConnections.length,
          activeConnections: enhancedConnections.filter(c => c.isActive).length,
          connectionsWithRefreshToken: enhancedConnections.filter(c => c.hasRefreshToken).length,
          connectionsNeedingReconnection: enhancedConnections.filter(c => c.analysis.needsReconnection).length
        }
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Manual token exchange debug endpoint for testing OAuth flow
   */
  @Get('debug/manual-token-exchange/:code')
  async debugManualTokenExchange(@Param('code') code: string) {
    try {
      console.log('=== MANUAL TOKEN EXCHANGE DEBUG ===');
      console.log('🔑 Authorization code received:', code);
      console.log('🔑 Code length:', code.length);
      console.log('🔑 Code preview:', code.substring(0, 20) + '...');
      
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = process.env.GOOGLE_CALLBACK_URL;
      
      console.log('🔧 OAuth Configuration:');
      console.log('🔧 - Client ID:', clientId ? 'Present' : 'Missing');
      console.log('🔧 - Client Secret:', clientSecret ? 'Present' : 'Missing');
      console.log('🔧 - Redirect URI:', redirectUri || 'Missing');
      
      if (!clientId || !clientSecret || !redirectUri) {
        return {
          success: false,
          error: 'Missing OAuth configuration',
          details: {
            hasClientId: !!clientId,
            hasClientSecret: !!clientSecret,
            hasRedirectUri: !!redirectUri
          }
        };
      }
      
      // Prepare token exchange request
      const tokenRequest = {
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code: code
      };
      
      console.log('📤 Token exchange request details:', {
        grant_type: tokenRequest.grant_type,
        client_id: clientId.substring(0, 20) + '...',
        client_secret: '[REDACTED]',
        redirect_uri: redirectUri,
        code: code.substring(0, 20) + '...'
      });
      
      console.log('🌐 Making request to Google token endpoint...');
      const startTime = Date.now();
      
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(tokenRequest),
      });
      
      const responseTime = Date.now() - startTime;
      console.log(`⏱️ Response received in ${responseTime}ms`);
      console.log(`📡 Response status: ${response.status} ${response.statusText}`);
      
      const responseText = await response.text();
      console.log(`📄 Raw response:`, responseText);
      
      let tokenResponse;
      try {
        tokenResponse = JSON.parse(responseText);
        console.log('✅ Response parsed as JSON successfully');
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError);
        return {
          success: false,
          error: 'Invalid JSON response from Google',
          rawResponse: responseText,
          status: response.status
        };
      }
      
      console.log('=== GOOGLE TOKEN RESPONSE ANALYSIS ===');
      console.log('🔑 Access token present:', !!tokenResponse.access_token);
      console.log('🔄 Refresh token present:', !!tokenResponse.refresh_token);
      console.log('📋 Token type:', tokenResponse.token_type);
      console.log('⏰ Expires in:', tokenResponse.expires_in);
      console.log('📋 Scope:', tokenResponse.scope);
      
      if (tokenResponse.access_token) {
        console.log('🔑 Access token length:', tokenResponse.access_token.length);
        console.log('🔑 Access token preview:', tokenResponse.access_token.substring(0, 20) + '...');
      }
      
      if (tokenResponse.refresh_token) {
        console.log('🔄 Refresh token length:', tokenResponse.refresh_token.length);
        console.log('🔄 Refresh token preview:', tokenResponse.refresh_token.substring(0, 20) + '...');
        console.log('✅ SUCCESS: Refresh token received from Google!');
      } else {
        console.log('❌ CRITICAL: No refresh token in response!');
        console.log('❌ This confirms the issue is with Google OAuth, not our code');
        console.log('❌ Check Google Cloud Console OAuth consent screen settings');
      }
      
      if (tokenResponse.error) {
        console.log('❌ Google returned error:', tokenResponse.error);
        console.log('❌ Error description:', tokenResponse.error_description);
      }
      
      return {
        success: true,
        responseTime,
        status: response.status,
        hasAccessToken: !!tokenResponse.access_token,
        hasRefreshToken: !!tokenResponse.refresh_token,
        tokenType: tokenResponse.token_type,
        expiresIn: tokenResponse.expires_in,
        scope: tokenResponse.scope,
        error: tokenResponse.error,
        errorDescription: tokenResponse.error_description,
        fullResponse: tokenResponse
      };
      
    } catch (error: any) {
      console.error('❌ Error in manual token exchange debug:', error);
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }

  @Get('debug/manual-token-exchange')
  async manualTokenExchange(@Query('code') code: string) {
    if (!code) {
      return { error: 'Authorization code required' };
    }

    try {
      const tokenResponse = await this.authService.exchangeCodeForTokens(code);
      return {
        success: true,
        tokenResponse,
        analysis: {
          hasRefreshToken: !!tokenResponse.refresh_token,
          refreshTokenLength: tokenResponse.refresh_token?.length || 0,
          accessTokenLength: tokenResponse.access_token?.length || 0,
          expiresIn: tokenResponse.expires_in,
          tokenType: tokenResponse.token_type,
          scope: tokenResponse.scope
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }

  /**
   * Get OAuth authorization URL for Google Business Profile
   */
  @Get('oauth/authorize')
  async getOAuthAuthorizationUrl() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    // Use the existing callback URL that's already configured in Google Cloud Console
    const redirectUri = process.env.GOOGLE_CALLBACK_URL;
    
    if (!clientId || !redirectUri) {
      return { error: 'Missing environment variables' };
    }

    // Test multiple business-related scopes - ONLY VALID, CURRENT SCOPES
    const scopeOptions = [
      {
        name: 'Basic Business (Current)',
        scopes: ['profile', 'email', 'https://www.googleapis.com/auth/business.manage']
      },
      {
        name: 'GMB Business Profile',
        scopes: ['profile', 'email', 'https://www.googleapis.com/auth/business.manage', 'https://www.googleapis.com/auth/plus.business.manage']
      },
      {
        name: 'Business Profile + My Business',
        scopes: ['profile', 'email', 'https://www.googleapis.com/auth/business.manage', 'https://www.googleapis.com/auth/mybusiness.manage']
      },
      {
        name: 'Full Business Access',
        scopes: ['profile', 'email', 'https://www.googleapis.com/auth/business.manage', 'https://www.googleapis.com/auth/plus.business.manage', 'https://www.googleapis.com/auth/mybusiness.manage']
      },
      {
        name: 'Minimal Business',
        scopes: ['profile', 'email', 'https://www.googleapis.com/auth/business.manage']
      }
    ];

    const results = scopeOptions.map(option => {
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: option.scopes.join(' '),
        response_type: 'code',
        access_type: 'offline',
        prompt: 'consent',
        include_granted_scopes: 'false'
      });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

      return {
        name: option.name,
        scopes: option.scopes,
        authUrl,
        params: {
          client_id: clientId,
          redirect_uri: redirectUri,
          scopes: option.scopes,
          access_type: 'offline',
          prompt: 'consent',
          include_granted_scopes: 'false'
        }
      };
    });

    return {
      scopeOptions: results,
      environment: {
        GOOGLE_CLIENT_ID: clientId ? '✅ Set' : '❌ Missing',
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
        GOOGLE_CALLBACK_URL: redirectUri ? '✅ Set' : '❌ Missing'
      },
      recommendation: 'Try the different scope options to see which one gives access to your business account. Start with "Business Account" or "Full Business Access".'
    };
  }

  @Get('debug/business-capabilities/:email')
  async debugBusinessCapabilities(@Param('email') email: string) {
    try {
      return await this.businessProfileService.testApiCapabilities(email);
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('test-endpoints/:email')
  async testPostEndpoints(@Param('email') email: string) {
    try {
      const googleProfile = await this.businessProfileService.getActiveGoogleProfile(email);
      if (!googleProfile?.refreshToken) {
        return { error: 'No refresh token available', canPost: false };
      }

      const accessToken = await this.businessProfileService.refreshAccessToken(googleProfile.refreshToken);
      
      // Get the first available location dynamically
      const accountsResponse = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!accountsResponse.ok) {
        return { error: 'Failed to fetch accounts', canPost: false };
      }
      
      const accountsData = await accountsResponse.json();
      const firstAccount = accountsData.accounts?.[0];
      
      if (!firstAccount) {
        return { error: 'No business accounts found', canPost: false };
      }
      
      // Get locations for the first account
      const locationsResponse = await fetch(`https://mybusinessaccountmanagement.googleapis.com/v1/${firstAccount.name}/locations`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!locationsResponse.ok) {
        return { error: 'Failed to fetch locations', canPost: false };
      }
      
      const locationsData = await locationsResponse.json();
      const firstLocation = locationsData.locations?.[0];
      
      if (!firstLocation) {
        return { error: 'No locations found', canPost: false };
      }

      // Test all posting endpoints
      const endpointResults = await this.businessProfileService.testPostsEndpoints(
        firstLocation.name,
        accessToken
      );

      return {
        location: firstLocation.name,
        account: firstAccount.name,
        endpointResults
      };
    } catch (error) {
      return {
        error: error.message,
        canPost: false
      };
    }
  }

  @Post('test-post/:email')
  async testCreatePost(@Param('email') email: string, @Body() postData: any) {
    try {
      const googleProfile = await this.businessProfileService.getActiveGoogleProfile(email);
      if (!googleProfile?.refreshToken) {
        return { error: 'No refresh token available', canPost: false };
      }

      const accessToken = await this.businessProfileService.refreshAccessToken(googleProfile.refreshToken);
      
      // Use the business profile service to create a test post
      try {
        const testPostContent = {
          message: 'Test post from API - Testing business profile integration',
          postType: 'STANDARD' as const,
          callToActionType: 'LEARN_MORE' as const,
          callToActionUrl: 'https://www.spotless.homes/tampa-cleaning-service'
        };

        // Get the first available location dynamically
        const accountsResponse = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (!accountsResponse.ok) {
          return { error: 'Failed to fetch accounts', canPost: false };
        }
        
        const accountsData = await accountsResponse.json();
        const firstAccount = accountsData.accounts?.[0];
        
        if (!firstAccount) {
          return { error: 'No business accounts found', canPost: false };
        }
        
        // Get locations for the first account
        const locationsResponse = await fetch(`https://mybusinessaccountmanagement.googleapis.com/v1/${firstAccount.name}/locations`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (!locationsResponse.ok) {
          return { error: 'Failed to fetch locations', canPost: false };
        }
        
        const locationsData = await locationsResponse.json();
        const firstLocation = locationsData.locations?.[0];
        
        if (!firstLocation) {
          return { error: 'No locations found', canPost: false };
        }

        // Use the service method to create the post
        const result = await this.businessProfileService.createBusinessPost(
          firstLocation.name,
          testPostContent,
          email
        );

        return {
          status: 200,
          statusText: 'OK',
          data: result,
          canPost: true
        };
      } catch (error) {
        return {
          error: error.message,
          canPost: false
        };
      }
    } catch (error) {
      return {
        error: error.message,
        canPost: false
      };
    }
  }

  @Post('debug/test-raw-token-exchange')
  async testRawTokenExchange(@Body() body: { code: string }) {
    const { code } = body;
    
    if (!code) {
      return { error: 'Authorization code required in request body' };
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_CALLBACK_URL;

    if (!clientId || !clientSecret || !redirectUri) {
      return { 
        error: 'Missing environment variables',
        env: {
          clientId: !!clientId,
          clientSecret: !!clientSecret,
          redirectUri: !!redirectUri
        }
      };
    }

    try {
      // Direct HTTP request to Google's token endpoint
      const tokenUrl = 'https://oauth2.googleapis.com/token';
      const tokenData = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      });

      console.log('🔍 Testing raw token exchange with Google...');
      console.log('📡 Token URL:', tokenUrl);
      console.log('📊 Request data:', {
        client_id: clientId,
        client_secret: '***HIDDEN***',
        code: code.substring(0, 20) + '...',
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      });

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: tokenData.toString()
      });

      const responseText = await response.text();
      console.log('📡 Google response status:', response.status);
      console.log('📊 Google response headers:', Object.fromEntries(response.headers.entries()));
      console.log('📄 Google response body:', responseText);

      let responseJson;
      try {
        responseJson = JSON.parse(responseText);
      } catch (e) {
        return {
          success: false,
          error: 'Invalid JSON response from Google',
          status: response.status,
          responseText,
          headers: Object.fromEntries(response.headers.entries())
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: 'Google OAuth error',
          status: response.status,
          googleError: responseJson,
          requestData: {
            client_id: clientId,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
          }
        };
      }

      return {
        success: true,
        status: response.status,
        tokenResponse: responseJson,
        analysis: {
          hasRefreshToken: !!responseJson.refresh_token,
          refreshTokenLength: responseJson.refresh_token?.length || 0,
          accessTokenLength: responseJson.access_token?.length || 0,
          expiresIn: responseJson.expires_in,
          tokenType: responseJson.token_type,
          scope: responseJson.scope,
          idToken: !!responseJson.id_token
        },
        headers: Object.fromEntries(response.headers.entries())
      };

    } catch (error) {
      console.error('❌ Raw token exchange error:', error);
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }

  // ===== FACEBOOK OAUTH ENDPOINTS =====

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth() {
    console.log('🚀 Facebook OAuth initiated');
    // Guard will handle the OAuth flow
  }

  @Get('facebook/oauth/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookCallback(@Req() req: any, @Res() res: Response) {
    const startTime = new Date().toISOString();
    const requestId = Math.random().toString(36).substring(7);
    
    console.log(`=== FACEBOOK OAUTH CALLBACK DEBUG [${requestId}] [${startTime}] ===`);
    console.log(`🔍 Request ID: ${requestId}`);
    console.log(`⏰ Start Time: ${startTime}`);
    console.log(`📨 Request user keys:`, Object.keys(req.user || {}));
    
    try {
      const { accessToken, profile } = req.user;
      
      console.log(`=== FACEBOOK TOKEN ANALYSIS [${requestId}] ===`);
      console.log(`🔑 Access Token:`, accessToken ? `Present (${accessToken.length} chars)` : 'Missing');
      console.log(`📱 Profile:`, profile ? `Present (${Object.keys(profile).length} keys)` : 'Missing');
      
      if (accessToken) {
        console.log(`🔑 Access Token Preview:`, accessToken.substring(0, 20) + '...');
        console.log(`🔑 Access Token Type:`, typeof accessToken);
      }
      
      console.log(`=== FACEBOOK PAGES FETCH [${requestId}] ===`);
      console.log(`👤 User email:`, profile?.emails?.[0]?.value || 'Unknown');
      console.log(`🔑 Access token for pages fetch:`, accessToken ? 'PRESENT' : 'MISSING');
      
      // Fetch Facebook pages using the access token
      const pagesResult = await this.authService.getFacebookPagesDirect(accessToken);
      
      if (!pagesResult || pagesResult.error) {
        console.error(`❌ Failed to fetch Facebook pages:`, pagesResult?.error);
        throw new Error(`Failed to fetch Facebook pages: ${pagesResult?.error}`);
      }
      
      console.log(`✅ Successfully fetched ${pagesResult.pages?.length || 0} Facebook pages`);
      
      // Store the Facebook connection with pages
      const dbSaveStartTime = Date.now();
      const result = await this.authService.storeFacebookConnection(profile, accessToken, pagesResult.pages || []);
      const dbSaveDuration = Date.now() - dbSaveStartTime;
      
      console.log(`=== FACEBOOK DATABASE SAVE [${requestId}] ===`);
      console.log(`💾 Save result:`, result.success ? 'SUCCESS' : 'FAILED');
      console.log(`⏱️ Database save duration:`, dbSaveDuration, 'ms');
      console.log(`📄 Pages stored:`, result.pagesCount);
      
      if (result.success) {
        const redirectUrl = `http://localhost:3000/integration/callback?success=true&platform=facebook&profile_id=${result.profileId}&email=${encodeURIComponent(result.userEmail || '')}&pages=${result.pagesCount}`;
        console.log(`🎯 Redirecting to:`, redirectUrl);
        res.redirect(redirectUrl);
      } else {
        const redirectUrl = `http://localhost:3000/integration/callback?success=false&error=${encodeURIComponent(result.error)}`;
        console.log(`❌ Redirecting to error:`, redirectUrl);
        res.redirect(redirectUrl);
      }
    } catch (error) {
      console.error(`❌ Error in Facebook OAuth callback [${requestId}]:`, error);
      const redirectUrl = `http://localhost:3000/integration/callback?success=false&error=${encodeURIComponent('Failed to store Facebook connection')}`;
      res.redirect(redirectUrl);
    } finally {
      const endTime = new Date().toISOString();
      console.log(`=== FACEBOOK OAUTH CALLBACK COMPLETE [${requestId}] ===`);
      console.log(`⏰ End Time: ${endTime}`);
      console.log(`⏱️ Total Duration: ${new Date(endTime).getTime() - new Date(startTime).getTime()}ms`);
    }
  }

  @Get('facebook/pages/:email')
  async getFacebookPages(@Param('email') email: string) {
    try {
      console.log(`🔍 Fetching Facebook pages for user: ${email}`);
      const result = await this.authService.getFacebookPages(email);
      
      if (result.error) {
        return { success: false, error: result.error };
      }
      
      return {
        success: true,
        pages: result.pages,
        count: result.count
      };
    } catch (error: any) {
      console.error('❌ Error fetching Facebook pages:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== FACEBOOK DEBUG ENDPOINTS =====

  @Get('debug/facebook')
  async debugFacebook() {
    try {
      return {
        success: true,
        appId: process.env.FACEBOOK_APP_ID ? 'Present' : 'Missing',
        callbackUrl: process.env.FACEBOOK_CALLBACK_URL || 'Missing',
        environment: process.env.NODE_ENV || 'development',
        mockingEnabled: process.env.NODE_ENV === 'development',
        scopes: [
          'public_profile',
          'email',
          'pages_manage_posts',
          'pages_read_engagement',
          'pages_show_list',
          'business_management'
        ]
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Get('debug/facebook-pages/:email')
  async debugFacebookPages(@Param('email') email: string) {
    try {
      console.log(`🔍 Debug: Fetching Facebook pages for user: ${email}`);
      const result = await this.authService.getFacebookPages(email);
      
      if (result.error) {
        return { 
          success: false, 
          error: result.error,
          debug: {
            email,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV
          }
        };
      }
      
      return {
        success: true,
        pages: result.pages,
        count: result.count,
        debug: {
          email,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
          mockingEnabled: process.env.NODE_ENV === 'development'
        }
      };
    } catch (error: any) {
      console.error('❌ Error in Facebook pages debug:', error);
      return { success: false, error: error.message };
    }
  }

  @Get('debug/test-business-access')
  async testBusinessAccess() {
    try {
      // This will test what business accounts we can actually access
      // with the current OAuth tokens
      const userEmail = 'spotlesshomestampa@gmail.com'; // Hardcoded for testing
      
      // Use the correct endpoint that exists
      const response = await fetch(`http://localhost:3001/auth/business-accounts/${userEmail}`);
      const data = await response.json();
      
      return {
        success: true,
        businessAccountsResponse: data,
        analysis: {
          hasAccounts: data.success && data.accounts && data.accounts.length > 0,
          accountCount: data.success ? (data.accounts?.length || 0) : 0,
          accountTypes: data.success ? data.accounts?.map((acc: any) => acc.type) : [],
          verificationStates: data.success ? data.accounts?.map((acc: any) => acc.verificationState) : [],
          error: data.success ? null : data.error
        },
        recommendation: data.success && data.accounts?.length > 0 
          ? 'Business accounts found! Check if any are BUSINESS type and VERIFIED.'
          : 'No business accounts accessible. Try different OAuth scopes or check account permissions.'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }

  @Get('debug/check-all-account-types')
  async checkAllAccountTypes() {
    try {
      // Test different Google APIs to see what accounts are accessible
      const userEmail = 'spotlesshomestampa@gmail.com';
      
      const results: any = {
        businessProfile: null,
        adminDirectory: null,
        userInfo: null,
        drive: null,
        gmail: null
      };

      // Test Business Profile API
      try {
        const businessResponse = await fetch(`http://localhost:3001/auth/business-accounts/${userEmail}`);
        const businessData = await businessResponse.json();
        results.businessProfile = businessData;
      } catch (e) {
        results.businessProfile = { error: e.message };
      }

      // Test Admin Directory API (if accessible)
      try {
        const adminResponse = await fetch(`https://admin.googleapis.com/admin/directory/v1/users?domain=spotlesshomestampa.com`, {
          headers: {
            'Authorization': `Bearer ${process.env.GOOGLE_ACCESS_TOKEN || 'NO_TOKEN'}`
          }
        });
        const adminData = await adminResponse.json();
        results.adminDirectory = adminData;
      } catch (e) {
        results.adminDirectory = { error: e.message };
      }

      // Test User Info API
      try {
        const userInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo`, {
          headers: {
            'Authorization': `Bearer ${process.env.GOOGLE_ACCESS_TOKEN || 'NO_TOKEN'}`
          }
        });
        const userInfoData = await userInfoResponse.json();
        results.userInfo = userInfoData;
      } catch (e) {
        results.userInfo = { error: e.message };
      }

      return {
        success: true,
        accountCheckResults: results,
        analysis: {
          hasBusinessProfile: results.businessProfile?.success || false,
          hasAdminAccess: !results.adminDirectory?.error || false,
          hasUserInfo: !results.userInfo?.error || false,
          accountTypes: {
            business: results.businessProfile?.success || false,
            admin: !results.adminDirectory?.error || false,
            personal: !results.userInfo?.error || false
          }
        },
        recommendation: 'This will help identify what types of Google accounts and APIs are accessible with your current OAuth tokens.'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }

  @Get('debug/test-gmb-api')
  async testGmbApi() {
    try {
      const userEmail = 'spotlesshomestampa@gmail.com';
      
      // Test different GMB API endpoints
      const results: any = {
        businessAccounts: null,
        gmbLocations: null,
        gmbPosts: null,
        gmbReviews: null
      };

      // Test 1: Business Accounts (current endpoint)
      try {
        const businessResponse = await fetch(`http://localhost:3001/auth/business-accounts/${userEmail}`);
        const businessData = await businessResponse.json();
        results.businessAccounts = businessData;
      } catch (e) {
        results.businessAccounts = { error: e.message };
      }

      // Test 2: GMB Locations API (if accessible)
      try {
        // Try to access GMB locations directly
        const gmbResponse = await fetch(`https://mybusiness.googleapis.com/v4/accounts`, {
          headers: {
            'Authorization': `Bearer ${process.env.GOOGLE_ACCESS_TOKEN || 'NO_TOKEN'}`
          }
        });
        const gmbData = await gmbResponse.json();
        results.gmbLocations = gmbData;
      } catch (e) {
        results.gmbLocations = { error: e.message };
      }

      // Test 3: GMB Posts API
      try {
        const postsResponse = await fetch(`https://mybusiness.googleapis.com/v4/accounts/109194636448236279020/locations`, {
          headers: {
            'Authorization': `Bearer ${process.env.GOOGLE_ACCESS_TOKEN || 'NO_TOKEN'}`
          }
        });
        const postsData = await postsResponse.json();
        results.gmbPosts = postsData;
      } catch (e) {
        results.gmbPosts = { error: e.message };
      }

      // Test 4: GMB Reviews API
      try {
        const reviewsResponse = await fetch(`https://mybusiness.googleapis.com/v4/accounts/109194636448236279020/locations`, {
          headers: {
            'Authorization': `Bearer ${process.env.GOOGLE_ACCESS_TOKEN || 'NO_TOKEN'}`
          }
        });
        const reviewsData = await reviewsResponse.json();
        results.gmbReviews = reviewsData;
      } catch (e) {
        results.gmbReviews = { error: e.message };
      }

      return {
        success: true,
        gmbApiResults: results,
        analysis: {
          hasBusinessAccounts: results.businessAccounts?.success || false,
          hasGmbAccess: !results.gmbLocations?.error || false,
          hasGmbPosts: !results.gmbPosts?.error || false,
          hasGmbReviews: !results.gmbReviews?.error || false,
          accountId: '109194636448236279020'
        },
        recommendation: 'This will test direct access to GMB API endpoints to see if we can bypass the Business Profile API restrictions.'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }

  /**
   * Debug OAuth callback endpoint for the working OAuth flow
   */
  @Get('debug/oauth/callback')
  async debugOAuthCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    try {
      console.log('=== DEBUG OAUTH CALLBACK ===');
      console.log('🔑 Authorization code received:', code);
      console.log('🔑 State:', state);
      
      if (!code) {
        console.error('❌ No authorization code received');
        return res.redirect('/integration?error=no_code');
      }
      
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = process.env.GOOGLE_CALLBACK_URL;
      
      if (!clientId || !clientSecret || !redirectUri) {
        console.error('❌ Missing OAuth configuration');
        return res.redirect('/integration?error=config_missing');
      }
      
      // Exchange authorization code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code: code
        }),
      });
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('❌ Token exchange failed:', errorText);
        return res.redirect('/integration?error=token_exchange_failed');
      }
      
      const tokenData = await tokenResponse.json();
      console.log('✅ Token exchange successful');
      console.log('🔑 Access token present:', !!tokenData.access_token);
      console.log('🔄 Refresh token present:', !!tokenData.refresh_token);
      
      if (!tokenData.refresh_token) {
        console.error('❌ No refresh token received');
        return res.redirect('/integration?error=no_refresh_token');
      }
      
      // Get user profile using access token
      const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });
      
      if (!profileResponse.ok) {
        console.error('❌ Failed to get user profile');
        return res.redirect('/integration?error=profile_failed');
      }
      
      const profile = await profileResponse.json();
      console.log('✅ User profile retrieved:', profile.email);
      
      // Store the OAuth connection in database
      const result = await this.authService.storeGoogleConnection(
        profile, 
        tokenData.access_token, 
        tokenData.refresh_token
      );
      
      if (result.success) {
        console.log('✅ OAuth connection stored successfully');
        // Redirect to frontend with success
        return res.redirect('/integration?success=true&platform=google');
      } else {
        console.error('❌ Failed to store OAuth connection');
        return res.redirect('/integration?error=storage_failed');
      }
      
    } catch (error) {
      console.error('❌ Debug OAuth callback error:', error);
      return res.redirect('/integration?error=callback_error');
    }
  }

  /**
   * Test profile image fetching for a specific location
   */
  @Get('test-profile-image/:email')
  async testProfileImage(@Param('email') email: string) {
    try {
      const locationName = 'locations/2141374650782668963';
      const result = await this.businessProfileService.getLocationDetailsWithProfile(locationName, email);
      
      return {
        success: true,
        locationName,
        profileData: {
          hasProfile: !!result.profile,
          hasProfileImageUri: !!result.profileImageUri,
          profileImageUri: result.profileImageUri,
          profileKeys: result.profile ? Object.keys(result.profile) : [],
          fullProfile: result.profile
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        locationName: 'locations/2141374650782668963'
      };
    }
  }

  /**
   * Debug location data from all endpoints to find profile image
   */
  @Get('debug-location-data/:email')
  async debugLocationData(@Param('email') email: string) {
    try {
      // Test all three endpoints directly to see which one returns profile data
      const googleProfile = await this.businessProfileService.getActiveGoogleProfile(email);
      if (!googleProfile?.refreshToken) {
        return { error: 'No refresh token available' };
      }
      
      const accessToken = await this.businessProfileService.refreshAccessToken(googleProfile.refreshToken);
      const locationName = 'locations/2141374650782668963';
      
      const endpoints = [
        `https://mybusinessbusinessinformation.googleapis.com/v1/${locationName}?readMask=title,address,phoneNumbers,websiteUri,regularHours,categories,serviceArea,profile,rating,reviewCount`,
        `https://mybusinessaccountmanagement.googleapis.com/v1/${locationName}`,
        `https://mybusiness.googleapis.com/v4/accounts/109194636448236279020/locations/2141374650782668963`
      ];
      
      const results: any[] = [];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          
          if (response.ok) {
            const data = await response.json();
            results.push({
              endpoint,
              status: response.status,
              hasProfile: !!data.profile,
              hasLogoUri: !!data.logoUri,
              profileKeys: data.profile ? Object.keys(data.profile) : [],
              allKeys: Object.keys(data),
              sampleData: {
                title: data.title,
                profile: data.profile,
                logoUri: data.logoUri
              }
            });
          } else {
            results.push({
              endpoint,
              status: response.status,
              error: await response.text()
            });
          }
        } catch (error) {
          results.push({
            endpoint,
            status: 'ERROR',
            error: error.message
          });
        }
      }
      
      return { success: true, results };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Test profile images fetching specifically
   */
  @Get('test-profile-images/:email')
  async testProfileImages(@Param('email') email: string) {
    try {
      const locationName = 'locations/2141374650782668963';
      const result = await this.businessProfileService.fetchProfileImages(locationName, email);
      
      return {
        success: true,
        locationName,
        result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        locationName: 'locations/2141374650782668963'
      };
    }
  }

  /**
   * Step-by-step debug for profile image fetching
   */
  @Get('debug-profile-image-step/:email')
  async debugProfileImageStep(@Param('email') email: string) {
    try {
      const locationName = 'locations/2141374650782668963';
      
      // Step 1: Get the user's Google profile
      const googleProfile = await this.businessProfileService.getActiveGoogleProfile(email);
      if (!googleProfile?.refreshToken) {
        return { error: 'No refresh token available' };
      }
      
      // Step 2: Refresh access token
      const accessToken = await this.businessProfileService.refreshAccessToken(googleProfile.refreshToken);
      
      // Step 3: Test each endpoint individually with detailed logging
      const endpoints = [
        {
          name: 'Business Information API',
          url: `https://mybusinessbusinessinformation.googleapis.com/v1/${locationName}?readMask=title,address,phoneNumbers,websiteUri,regularHours,categories,serviceArea`
        },
        {
          name: 'Account Management API',
          url: `https://mybusinessaccountmanagement.googleapis.com/v1/${locationName}?readMask=name,title,storefrontAddress,phoneNumbers,websiteUri,regularHours,categories,serviceArea`
        },
        {
          name: 'My Business API v4',
          url: `https://mybusiness.googleapis.com/v4/accounts/109194636448236279020/locations/2141374650782668963`
        }
      ];
      
      const results: any[] = [];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 Testing ${endpoint.name}: ${endpoint.url}`);
          
          const response = await fetch(endpoint.url, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log(`✅ ${endpoint.name} succeeded`);
            
            // Analyze the response for profile image data
            const analysis = {
              endpoint: endpoint.name,
              status: response.status,
              hasProfile: !!data.profile,
              hasLogoUri: !!data.logoUri,
              hasImageUri: !!data.imageUri,
              hasMedia: !!data.media,
              profileKeys: data.profile ? Object.keys(data.profile) : [],
              topLevelKeys: Object.keys(data),
              profileImageUri: data.profile?.profileImageUri || null,
              logoUri: data.profile?.logoUri || data.logoUri || null,
              imageUri: data.profile?.imageUri || data.imageUri || null,
              mediaCount: data.media?.length || 0,
              sampleData: {
                title: data.title,
                profile: data.profile,
                logoUri: data.logoUri,
                imageUri: data.imageUri,
                media: data.media ? data.media.slice(0, 2) : null // First 2 media items
              }
            };
            
            results.push(analysis);
            console.log(`📊 Analysis for ${endpoint.name}:`, analysis);
          } else {
            const errorText = await response.text();
            results.push({
              endpoint: endpoint.name,
              status: response.status,
              error: errorText,
              success: false
            });
            console.log(`❌ ${endpoint.name} failed: ${response.status} - ${errorText}`);
          }
        } catch (error) {
          results.push({
            endpoint: endpoint.name,
            status: 'ERROR',
            error: error.message,
            success: false
          });
          console.log(`❌ ${endpoint.name} error:`, error.message);
        }
      }
      
      // Step 4: Test the dedicated media endpoint
      console.log(`🔍 Testing dedicated media endpoint...`);
      const mediaResult = await this.businessProfileService.fetchProfileImages(locationName, email);
      
      return {
        success: true,
        locationName,
        endpointResults: results,
        mediaEndpointResult: mediaResult,
        summary: {
          totalEndpoints: endpoints.length,
          successfulEndpoints: results.filter(r => r.success !== false).length,
          hasProfileImage: results.some(r => r.profileImageUri || r.logoUri || r.imageUri),
          hasMedia: results.some(r => r.mediaCount > 0),
          mediaEndpointSuccess: mediaResult.success
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        locationName: 'locations/2141374650782668963'
      };
    }
  }
}

