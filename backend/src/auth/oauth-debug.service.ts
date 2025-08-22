import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface OAuthDebugInfo {
  timestamp: string;
  requestId: string;
  oauthConfig: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
    scopes: string[];
    accessType: string;
    prompt: string;
  };
  environment: {
    nodeEnv: string;
    googleClientId: string;
    googleClientSecret: string;
    googleCallbackUrl: string;
    googleApiKey: string;
  };
  generatedUrls: {
    authorizationUrl: string;
    tokenUrl: string;
  };
  validation: {
    hasClientId: boolean;
    hasClientSecret: boolean;
    hasCallbackUrl: boolean;
    hasApiKey: boolean;
    callbackUrlMatch: boolean;
  };
  recommendations: string[];
}

@Injectable()
export class OAuthDebugService {
  private readonly logger = new Logger(OAuthDebugService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Get comprehensive OAuth debugging information
   */
  getOAuthDebugInfo(): OAuthDebugInfo {
    const requestId = Math.random().toString(36).substring(7);
    const timestamp = new Date().toISOString();

    // Get environment variables
    const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID') || 'NOT_SET';
    const googleClientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET') || 'NOT_SET';
    const googleCallbackUrl = this.configService.get<string>('GOOGLE_CALLBACK_URL') || 'NOT_SET';
    const googleApiKey = this.configService.get<string>('GOOGLE_API_KEY') || 'NOT_SET';
    const nodeEnv = this.configService.get<string>('NODE_ENV') || 'development';

    // Build OAuth configuration
    const oauthConfig = {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      callbackUrl: googleCallbackUrl,
      scopes: [
        'profile',
        'email',
        'https://www.googleapis.com/auth/business.manage'
      ],
      accessType: 'offline',
      prompt: 'consent'
    };

    // Generate OAuth URLs
    const authorizationUrl = this.buildAuthorizationUrl(oauthConfig);
    const tokenUrl = 'https://oauth2.googleapis.com/token';

    // Validation checks
    const validation = {
      hasClientId: googleClientId !== 'NOT_SET',
      hasClientSecret: googleClientSecret !== 'NOT_SET',
      hasCallbackUrl: googleCallbackUrl !== 'NOT_SET',
      hasApiKey: googleApiKey !== 'NOT_SET',
      callbackUrlMatch: this.validateCallbackUrl(googleCallbackUrl)
    };

    // Generate recommendations
    const recommendations = this.generateRecommendations(validation, oauthConfig);

    return {
      timestamp,
      requestId,
      oauthConfig,
      environment: {
        nodeEnv,
        googleClientId,
        googleClientSecret,
        googleCallbackUrl,
        googleApiKey
      },
      generatedUrls: {
        authorizationUrl,
        tokenUrl
      },
      validation,
      recommendations
    };
  }

  /**
   * Build the complete OAuth authorization URL for testing
   */
  buildAuthorizationUrl(config: any): string {
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.callbackUrl,
      scope: config.scopes.join(' '),
      response_type: 'code',
      access_type: config.accessType,
      prompt: config.prompt
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Validate callback URL format
   */
  private validateCallbackUrl(callbackUrl: string): boolean {
    if (callbackUrl === 'NOT_SET') return false;
    
    try {
      const url = new URL(callbackUrl);
      return url.protocol === 'https:' || url.hostname === 'localhost';
    } catch {
      return false;
    }
  }

  /**
   * Generate debugging recommendations
   */
  private generateRecommendations(validation: any, oauthConfig: any): string[] {
    const recommendations: string[] = [];

    if (!validation.hasClientId) {
      recommendations.push('Set GOOGLE_CLIENT_ID environment variable');
    }

    if (!validation.hasClientSecret) {
      recommendations.push('Set GOOGLE_CLIENT_SECRET environment variable');
    }

    if (!validation.hasCallbackUrl) {
      recommendations.push('Set GOOGLE_CALLBACK_URL environment variable');
    }

    if (!validation.hasApiKey) {
      recommendations.push('Set GOOGLE_API_KEY environment variable');
    }

    if (!validation.callbackUrlMatch) {
      recommendations.push('GOOGLE_CALLBACK_URL must be HTTPS or localhost');
    }

    if (oauthConfig.clientId === 'NOT_SET' || oauthConfig.clientSecret === 'NOT_SET') {
      recommendations.push('Google OAuth credentials are not configured');
    }

    recommendations.push('Verify Google Cloud Console OAuth consent screen has "Offline" access type');
    recommendations.push('Ensure OAuth consent screen is published or user is added as test user');
    recommendations.push('Check that scopes are properly configured in Google Cloud Console');

    return recommendations;
  }

  /**
   * Test token refresh functionality
   */
  async testTokenRefresh(refreshToken: string): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    try {
      const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
      const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');

      if (!clientId || !clientSecret) {
        return {
          success: false,
          message: 'Google OAuth credentials not configured'
        };
      }

      if (!refreshToken) {
        return {
          success: false,
          message: 'No refresh token provided'
        };
      }

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      const responseText = await response.text();
      let responseData;

      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { raw: responseText };
      }

      if (!response.ok) {
        return {
          success: false,
          message: `Token refresh failed: ${response.status}`,
          details: {
            status: response.status,
            statusText: response.statusText,
            response: responseData
          }
        };
      }

      return {
        success: true,
        message: 'Token refresh successful',
        details: {
          status: response.status,
          response: responseData
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Token refresh error: ${error.message}`,
        details: { error: error.toString() }
      };
    }
  }

  /**
   * Validate environment configuration
   */
  validateEnvironment(): {
    isValid: boolean;
    issues: string[];
    warnings: string[];
  } {
    const issues: string[] = [];
    const warnings: string[] = [];

    const requiredVars = [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GOOGLE_CALLBACK_URL'
    ];

    for (const varName of requiredVars) {
      const value = this.configService.get<string>(varName);
      if (!value || value === 'NOT_SET') {
        issues.push(`${varName} is not set`);
      }
    }

    const nodeEnv = this.configService.get<string>('NODE_ENV');
    if (nodeEnv === 'production') {
      const callbackUrl = this.configService.get<string>('GOOGLE_CALLBACK_URL');
      if (callbackUrl && !callbackUrl.startsWith('https://')) {
        issues.push('GOOGLE_CALLBACK_URL must use HTTPS in production');
      }
    }

    const googleApiKey = this.configService.get<string>('GOOGLE_API_KEY');
    if (!googleApiKey || googleApiKey === 'NOT_SET') {
      warnings.push('GOOGLE_API_KEY is not set - some API features may not work');
    }

    return {
      isValid: issues.length === 0,
      issues,
      warnings
    };
  }
}
