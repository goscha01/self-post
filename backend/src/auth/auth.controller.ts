import { Controller, UseGuards, Req, Get, Res, Param, Delete, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BusinessProfileService } from './business-profile.service';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private businessProfileService: BusinessProfileService
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
    console.log('🔄 Google OAuth callback received');
    console.log('📨 Request user:', JSON.stringify(req.user, null, 2));
    console.log('🌐 Frontend URL: http://localhost:3000 (Hardcoded)');
    
    try {
      // Handle OAuth callback and redirect to frontend
      const { accessToken, refreshToken, profile } = req.user;
      
      console.log('🔑 Access Token:', accessToken ? 'Present' : 'Missing');
      console.log('🔄 Refresh Token:', refreshToken ? 'Present' : 'Missing');
      console.log('📱 Profile:', profile ? 'Present' : 'Missing');
      
      // Store the OAuth connection in database
      const result = await this.authService.storeGoogleConnection(profile, accessToken, refreshToken);
      
      if (result.success) {
        const redirectUrl = `http://localhost:3000/integration/callback?success=true&platform=google&profile_id=${result.profileId}&email=${encodeURIComponent(result.userEmail || '')}`;
        console.log('🎯 Redirecting to:', redirectUrl);
        res.redirect(redirectUrl);
      } else {
        const redirectUrl = `http://localhost:3000/integration/callback?success=false&error=${encodeURIComponent(result.error)}`;
        console.log('❌ Redirecting to error:', redirectUrl);
        res.redirect(redirectUrl);
      }
    } catch (error) {
      console.error('❌ Error in Google OAuth callback:', error);
      const redirectUrl = `http://localhost:3000/integration/callback?success=false&error=${encodeURIComponent('Failed to store connection')}`;
      res.redirect(redirectUrl);
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
}
