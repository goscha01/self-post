import { Controller, UseGuards, Req, Get, Res, Param, Delete, Post, Body } from '@nestjs/common';
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
        profileKeys: profile ? Object.keys(profile) : [],
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
        const redirectUrl = `http://localhost:3000/integration/callback?success=true&platform=google&profile_id=${result.profileId}&email=${encodeURIComponent(result.userEmail || '')}`;
        console.log(`🎯 Redirecting to:`, redirectUrl);
        res.redirect(redirectUrl);
      } else {
        const redirectUrl = `http://localhost:3000/integration/callback?success=false&error=${encodeURIComponent(result.error)}`;
        console.log(`❌ Redirecting to error:`, redirectUrl);
        res.redirect(redirectUrl);
      }
    } catch (error) {
      console.error(`❌ Error in Google OAuth callback [${requestId}]:`, error);
      const redirectUrl = `http://localhost:3000/integration/callback?success=false&error=${encodeURIComponent('Failed to store connection')}`;
      res.redirect(redirectUrl);
    } finally {
      const endTime = new Date().toISOString();
      console.log(`=== OAUTH CALLBACK COMPLETE [${requestId}] ===`);
      console.log(`⏰ End Time: ${endTime}`);
      console.log(`⏱️ Total Duration: ${new Date(endTime).getTime() - new Date(startTime).getTime()}ms`);
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
   * Detailed OAuth URL debugging with parameter breakdown
   */
  @Get('debug/oauth-url-detailed')
  async debugOAuthUrlDetailed() {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const callbackURL = process.env.GOOGLE_CALLBACK_URL;
      const scopes = [
        'profile',
        'email',
        'https://www.googleapis.com/auth/business.manage'
      ];
      
      console.log('=== DETAILED OAUTH URL DEBUG ===');
      console.log('🔧 Configuration values:');
      console.log('🔧 - Client ID:', clientId ? 'Present' : 'Missing');
      console.log('🔧 - Callback URL:', callbackURL || 'Missing');
      console.log('🔧 - Scopes:', scopes);
      console.log('🔧 - Access Type: offline');
      console.log('🔧 - Prompt: consent');
      console.log('🔧 - Include Granted Scopes: false (forces fresh authorization)');
      
      if (!clientId || !callbackURL) {
        return {
          success: false,
          error: 'Missing OAuth configuration',
          details: {
            hasClientId: !!clientId,
            hasCallbackUrl: !!callbackURL
          }
        };
      }
      
      // Build OAuth URL manually for debugging
      const url = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(clientId)}&` +
        `redirect_uri=${encodeURIComponent(callbackURL)}&` +
        `scope=${encodeURIComponent(scopes.join(' '))}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `include_granted_scopes=false`;
      
      console.log('🔗 Generated OAuth URL:');
      console.log('🔗 - Base:', 'https://accounts.google.com/o/oauth2/v2/auth');
      console.log('🔗 - Client ID:', clientId);
      console.log('🔗 - Redirect URI:', callbackURL);
      console.log('🔗 - Scopes:', scopes.join(' '));
      console.log('🔗 - Access Type: offline');
      console.log('🔗 - Prompt: consent');
      console.log('🔗 - Include Granted Scopes: false (forces fresh authorization)');
      
      return {
        success: true,
        url,
        breakdown: {
          client_id: clientId,
          redirect_uri: callbackURL,
          scopes: scopes,
          access_type: 'offline',
          prompt: 'consent',
          include_granted_scopes: false
        },
        encodedUrl: url,
        validation: {
          hasClientId: !!clientId,
          hasCallbackUrl: !!callbackURL,
          clientIdLength: clientId?.length || 0,
          callbackUrlLength: callbackURL?.length || 0,
          scopesCount: scopes.length,
          allScopesPresent: scopes.every(scope => scope.length > 0)
        }
      };
    } catch (error: any) {
      console.error('❌ Error in detailed OAuth URL debug:', error);
      return {
        success: false,
        error: error.message
      };
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
}
