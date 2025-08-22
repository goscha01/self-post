import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private configService: ConfigService) {
    const callbackURL = '/auth/facebook/oauth/callback';
    
    // Enhanced OAuth configuration with debugging
    const oauthConfig = {
      clientID: 'placeholder', // Will be replaced after super() call
      clientSecret: 'placeholder', // Will be replaced after super() call
      callbackURL: callbackURL,
      scope: [
        'public_profile',
        'email',
        'pages_manage_posts',
        'pages_read_engagement',
        'pages_show_list',
        'business_management'
      ],
      profileFields: [
        'id',
        'displayName',
        'name',
        'emails',
        'photos'
      ]
    };
    
    super(oauthConfig);
    
    // Get credentials from environment variables after super() call
    const clientID = this.configService.get<string>('FACEBOOK_APP_ID');
    const clientSecret = this.configService.get<string>('FACEBOOK_APP_SECRET');
    
    // Validate required environment variables
    if (!clientID || !clientSecret) {
      throw new Error('Facebook OAuth credentials not configured. Please set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET environment variables.');
    }
    
    // Update the strategy with real credentials
    (this as any)._oauth2._clientId = clientID;
    (this as any)._oauth2._clientSecret = clientSecret;
    
    console.log('🔧 Facebook Strategy initialized');
    console.log('🆔 App ID:', clientID ? 'Present (Environment)' : 'Missing (Environment)');
    console.log('🔐 App Secret:', clientSecret ? 'Present (Environment)' : 'Missing (Environment)');
    console.log('🎯 Callback URL:', callbackURL);
    console.log('📋 Scopes:', oauthConfig.scope);
    console.log('📊 Profile Fields:', oauthConfig.profileFields);
    console.log('📊 Full OAuth Config:', JSON.stringify(oauthConfig, null, 2));
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const requestId = Math.random().toString(36).substring(7);
    const timestamp = new Date().toISOString();

    console.log(`=== FACEBOOK STRATEGY VALIDATE [${requestId}] [${timestamp}] ===`);
    console.log(`🔍 [${requestId}] Facebook Strategy - validate called`);
    console.log(`📱 [${requestId}] Profile ID:`, profile?.id);
    console.log(`📱 [${requestId}] Profile Email:`, profile?.emails?.[0]?.value);
    console.log(`📱 [${requestId}] Profile Display Name:`, profile?.displayName);
    console.log(`🔑 [${requestId}] Access Token:`, accessToken ? `Present (${accessToken.length} chars)` : 'Missing');
    console.log(`🔄 [${requestId}] Refresh Token:`, refreshToken ? `Present (${refreshToken.length} chars)` : 'Missing');

    // Enhanced debugging for token analysis
    if (accessToken) {
      console.log(`🔑 [${requestId}] Access Token Preview:`, accessToken.substring(0, 20) + '...');
      console.log(`🔑 [${requestId}] Access Token Type:`, typeof accessToken);
      console.log(`🔑 [${requestId}] Access Token Length:`, accessToken.length);
      console.log(`🔑 [${requestId}] Access Token Valid:`, accessToken.length > 50 ? 'Yes' : 'No (too short)');
    }

    if (refreshToken) {
      console.log(`🔄 [${requestId}] Refresh Token Preview:`, refreshToken.substring(0, 20) + '...');
      console.log(`🔄 [${requestId}] Refresh Token Type:`, typeof refreshToken);
      console.log(`🔄 [${requestId}] Refresh Token Length:`, refreshToken.length);
      console.log(`🔄 [${requestId}] Refresh Token Valid:`, refreshToken.length > 50 ? 'Yes' : 'No (too short)');
      console.log(`✅ [${requestId}] SUCCESS: Refresh token received - offline access enabled!`);
    } else {
      console.log(`⚠️ [${requestId}] Note: Facebook typically doesn't provide refresh tokens`);
      console.log(`⚠️ [${requestId}] Access tokens are long-lived (60 days) and can be extended`);
      console.log(`⚠️ [${requestId}] This is normal Facebook OAuth behavior`);
    }

    // Log the exact return object for debugging
    const returnObject = {
      profile,
      accessToken,
      refreshToken,
      requestId,
      timestamp,
    };

    console.log(`📤 [${requestId}] Returning from validate:`, {
      hasProfile: !!returnObject.profile,
      hasAccessToken: !!returnObject.accessToken,
      hasRefreshToken: !!returnObject.refreshToken,
      profileKeys: returnObject.profile ? Object.keys(returnObject.profile) : [],
      requestId: returnObject.requestId,
      timestamp: returnObject.timestamp,
    });

    return returnObject;
  }
}
