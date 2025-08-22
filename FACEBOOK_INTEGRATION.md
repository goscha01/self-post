# Facebook Integration for Self-Post

This document provides comprehensive information about the Facebook integration implemented in the Self-Post application.

## 🚀 **Overview**

The Facebook integration allows users to:
- Connect their Facebook accounts via OAuth
- Manage multiple business pages
- Schedule and publish posts to Facebook pages
- View page insights and analytics
- Work in both development (mock) and production modes

## 🔧 **Architecture**

### **Backend Components**

1. **FacebookStrategy** (`backend/src/auth/strategies/facebook.strategy.ts`)
   - Handles Facebook OAuth authentication
   - Configures OAuth scopes and profile fields
   - Provides comprehensive logging for debugging

2. **FacebookApiService** (`backend/src/auth/facebook-api.service.ts`)
   - Manages Facebook Graph API interactions
   - Handles page management, posting, and insights
   - Implements development/production mode switching

3. **AuthService** (`backend/src/auth/auth.service.ts`)
   - Stores Facebook connections and page data
   - Manages user authentication state
   - Handles OAuth callback processing

4. **AuthController** (`backend/src/auth/auth.controller.ts`)
   - Provides Facebook OAuth endpoints
   - Includes comprehensive debugging endpoints
   - Handles OAuth callbacks and page management

### **Frontend Components**

1. **FacebookConnect** (`frontend/src/components/integration/facebook-connect.tsx`)
   - Main Facebook connection interface
   - Displays connected pages and status
   - Handles connection/disconnection

2. **FacebookDebugPanel** (`frontend/src/components/debug/facebook-debug-panel.tsx`)
   - Configuration verification
   - API testing tools
   - Development mode information

## 📋 **OAuth Scopes**

The Facebook integration requests the following permissions:

- `public_profile` - Basic profile information
- `email` - User email address
- `pages_manage_posts` - Post to Facebook pages
- `pages_read_engagement` - Read page insights
- `pages_show_list` - List user's pages
- `business_management` - Manage business accounts

## 🌐 **Environment Configuration**

### **Required Environment Variables**

```bash
# Facebook OAuth Configuration
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=http://localhost:3001/auth/facebook/oauth/callback

# App Configuration
NODE_ENV=development  # or production
```

### **Development vs Production Mode**

- **Development Mode** (`NODE_ENV=development`):
  - All Facebook posting is mocked
  - No actual content is sent to Facebook
  - Perfect for testing integration flow
  - Mock responses with realistic data

- **Production Mode** (`NODE_ENV=production`):
  - Real Facebook Graph API calls
  - Actual content posting to Facebook
  - Requires Facebook app approval

## 🔗 **API Endpoints**

### **OAuth Endpoints**

- `GET /auth/facebook` - Initiate Facebook OAuth
- `GET /auth/facebook/oauth/callback` - OAuth callback handler

### **Page Management**

- `GET /auth/facebook/pages/:email` - Get user's Facebook pages

### **Debug Endpoints**

- `GET /auth/debug/facebook` - Check Facebook configuration
- `GET /auth/debug/facebook-pages/:email` - Test page fetching

## 📱 **Facebook App Setup**

### **1. Create Facebook App**

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use existing one
3. Add **Facebook Login** product

### **2. Configure OAuth Settings**

- **Valid OAuth Redirect URIs**: `http://localhost:3001/auth/facebook/oauth/callback`
- **App Domains**: `localhost` (for development)

### **3. Set App Permissions**

- Configure the required OAuth scopes
- Set up app review process for advanced permissions

## 🧪 **Testing the Integration**

### **1. Check Configuration**

Use the debug panel to verify:
- Facebook App ID is configured
- Callback URL is set correctly
- Environment mode is active

### **2. Test OAuth Flow**

1. Click "Connect Facebook" button
2. Complete Facebook OAuth consent
3. Verify callback processing
4. Check page data storage

### **3. Test Page Management**

1. Use debug endpoints to test page fetching
2. Verify page data structure
3. Test mock posting functionality

## 🚨 **Common Issues & Solutions**

### **OAuth Errors**

- **redirect_uri_mismatch**: Update callback URL in Facebook app settings
- **invalid_scope**: Verify OAuth scopes are correctly configured
- **app_not_configured**: Check Facebook app ID and secret

### **API Errors**

- **Invalid access token**: Token may have expired
- **Page access denied**: User doesn't have admin access to pages
- **Rate limiting**: Facebook API quotas exceeded

### **Development Issues**

- **Mock mode not working**: Check `NODE_ENV` environment variable
- **Frontend connection errors**: Verify API endpoint configuration
- **Database errors**: Check social profile entity configuration

## 🔒 **Security Considerations**

### **Token Management**

- Access tokens are stored securely in database
- No tokens are exposed in frontend code
- OAuth state is properly validated

### **Permission Scoping**

- Only requested permissions are granted
- User consent is required for each scope
- Business permissions require app review

### **Data Privacy**

- User data is stored locally
- Facebook data is not shared with third parties
- OAuth tokens are encrypted in storage

## 📈 **Production Deployment**

### **1. Facebook App Review**

- Submit app for advanced access review
- Provide privacy policy and terms of service
- Demonstrate app functionality to reviewers

### **2. Environment Configuration**

- Set `NODE_ENV=production`
- Configure production callback URLs
- Update Facebook app settings

### **3. Monitoring & Analytics**

- Monitor OAuth success rates
- Track API usage and quotas
- Log errors and performance metrics

## 🔮 **Future Enhancements**

### **Planned Features**

- **Instagram Integration**: Extend to Instagram business accounts
- **Advanced Analytics**: Enhanced page insights and reporting
- **Bulk Operations**: Manage multiple pages simultaneously
- **Content Calendar**: Advanced scheduling and automation

### **API Improvements**

- **Webhook Support**: Real-time page updates
- **Batch Operations**: Efficient bulk API calls
- **Caching Layer**: Improved performance and reliability

## 📚 **Additional Resources**

- [Facebook Graph API Documentation](https://developers.facebook.com/docs/graph-api)
- [Facebook Login Best Practices](https://developers.facebook.com/docs/facebook-login/best-practices)
- [Facebook App Review Guidelines](https://developers.facebook.com/docs/app-review)
- [Facebook Business Manager](https://business.facebook.com/)

## 🆘 **Support & Troubleshooting**

For issues with the Facebook integration:

1. Check the debug panel for configuration issues
2. Review backend logs for OAuth errors
3. Verify Facebook app settings and permissions
4. Test with the provided debug endpoints
5. Check environment variable configuration

---

**Note**: This integration is designed to work seamlessly in both development and production environments, with comprehensive debugging tools to ensure smooth operation and easy troubleshooting.
