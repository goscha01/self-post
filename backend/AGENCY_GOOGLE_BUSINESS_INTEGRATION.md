# Agency-Style Google Business Profile Integration

## Overview

This implementation provides a **proper agency-style Google Business Profile integration** that follows OAuth 2.0 best practices for business applications. It's designed for agencies and businesses that need to manage multiple Google Business Profile accounts on behalf of their clients.

## ✅ CORRECT APPROACH (What This Implementation Does)

### 1. **OAuth 2.0 Authorization Code Flow**
- Uses proper web application OAuth flow (NOT personal account access)
- Requests business-specific scopes for profile management
- Stores refresh tokens for long-term access

### 2. **Business Profile Delegation**
- Users authenticate and grant permission to manage their business profiles
- App acts on behalf of businesses using stored credentials
- No real-time user authentication required for API calls

### 3. **Multi-Business Support**
- Supports multiple business accounts per authenticated user
- Handles multiple locations per business account
- Agency can manage multiple client businesses

### 4. **Offline Access with Refresh Tokens**
- Stores refresh tokens securely in database
- Automatically refreshes access tokens when needed
- Enables background operations without user presence

## ❌ WRONG APPROACH (What This Replaces)

- ❌ Direct personal account access
- ❌ Real-time user authentication for each API call
- ❌ Gmail/personal Google account integration
- ❌ Single business account limitation

## Technical Architecture

### 1. **OAuth Configuration**
```typescript
// Google Strategy Configuration
scope: [
  'https://www.googleapis.com/auth/business.manage',    // Primary business scope
  'https://www.googleapis.com/auth/plus.business.manage', // Legacy business scope
  'profile',                                           // Basic profile info
  'email'                                              // Email access
],
accessType: 'offline',                                 // Request refresh token
prompt: 'consent'                                      // Force consent screen
```

### 2. **Token Management**
- **Access Token**: Short-lived (1 hour), used for API calls
- **Refresh Token**: Long-lived, used to get new access tokens
- **Automatic Refresh**: Service automatically refreshes expired tokens

### 3. **Service Architecture**
```
BusinessProfileService
├── getBusinessAccounts()      // List all accessible business accounts
├── getBusinessProfileData()   // Get comprehensive business data
├── getLocationDetails()       // Get specific location details
├── createBusinessPost()       // Create business posts
├── replyToReview()           // Reply to customer reviews
└── updateBusinessInfo()      // Update business information
```

## API Endpoints

### **Business Account Management**
```
GET /auth/business-accounts/:email
```
Lists all business accounts the user has access to manage.

### **Business Profile Data**
```
GET /auth/business-profile/:email/:accountName
```
Fetches comprehensive data for a specific business account including:
- Account details and verification status
- All business locations
- Customer reviews
- Business posts
- Business insights and analytics

### **Location Operations**
```
GET /auth/location/:locationName/:email
```
Get detailed information about a specific business location.

### **Content Management**
```
POST /auth/post/:locationName/:email
```
Create new business posts for a location.

```
POST /auth/review/:reviewName/:email/reply
```
Reply to customer reviews.

### **Business Updates**
```
POST /auth/location/:locationName/:email/update
```
Update business information (hours, services, contact details, etc.).

## Data Flow

### 1. **Initial Connection**
```
User → OAuth Consent → Grant Business Access → Store Refresh Token
```

### 2. **Business Discovery**
```
Stored Refresh Token → Refresh Access Token → List Business Accounts
```

### 3. **Data Operations**
```
Stored Refresh Token → Refresh Access Token → Make API Calls → Return Data
```

### 4. **Background Operations**
```
Scheduled Tasks → Stored Refresh Token → Refresh Access Token → Perform Operations
```

## Security Features

### 1. **Token Security**
- Refresh tokens stored securely in database
- Access tokens never stored permanently
- Automatic token refresh with error handling

### 2. **Permission Validation**
- Only users with business management access can connect
- Scopes limited to business profile management
- No access to personal Gmail or other Google services

### 3. **Data Isolation**
- Users can only access businesses they manage
- No cross-user data access
- Proper error handling for unauthorized requests

## Usage Examples

### **Connecting a Business Account**
```typescript
// 1. User visits /auth/google
// 2. OAuth flow completes
// 3. Refresh token stored in database
// 4. User can now manage business profiles
```

### **Listing Business Accounts**
```typescript
const accounts = await businessProfileService.getBusinessAccounts(userEmail);
// Returns array of business accounts user can manage
```

### **Creating a Business Post**
```typescript
const postData = {
  summary: "New service announcement!",
  callToAction: {
    actionType: "LEARN_MORE",
    url: "https://example.com/service"
  }
};

const post = await businessProfileService.createBusinessPost(
  locationName, 
  postData, 
  userEmail
);
```

### **Updating Business Hours**
```typescript
const updateData = {
  regularHours: {
    periods: [
      {
        open: { day: 1, time: "09:00" },
        close: { day: 1, time: "17:00" }
      }
      // ... more days
    ]
  }
};

await businessProfileService.updateBusinessInfo(
  locationName, 
  updateData, 
  userEmail
);
```

## Setup Requirements

### 1. **Google Cloud Console**
- Enable Google My Business Account Management API
- Enable Google My Business Business Information API
- Enable Google My Business Place Actions API

### 2. **OAuth Consent Screen**
- Add business management scopes
- Configure for external users (if needed)
- Set proper app name and description

### 3. **Database Schema**
- Ensure `SocialProfile` entity has `refreshToken` field
- Add proper indexes for performance
- Implement secure token storage

## Testing Scenarios

### ✅ **Will Work**
- Business owners with verified Google Business Profile
- Agency managers with client business access
- Google Workspace admins with business profiles
- Multiple business accounts per user

### ❌ **Won't Work**
- Personal Google accounts without business access
- Unverified business accounts
- Expired or invalid refresh tokens
- Insufficient API permissions

## Troubleshooting

### **Common Issues**

1. **"No refresh token received"**
   - Check OAuth consent screen configuration
   - Ensure `accessType: 'offline'` is set
   - Verify user grants consent

2. **"Access denied" errors**
   - Verify API is enabled in Google Cloud Console
   - Check OAuth scopes are properly configured
   - Ensure user has business management permissions

3. **Token refresh failures**
   - Check refresh token is stored correctly
   - Verify client credentials are valid
   - Handle expired refresh tokens gracefully

### **Debug Information**
- Check backend logs for token refresh operations
- Monitor API response status codes
- Use browser console for OAuth flow debugging

## Next Steps

### 1. **Immediate**
- Test OAuth flow with business account
- Verify refresh token storage
- Test business account listing

### 2. **Short-term**
- Implement business post creation
- Add review management features
- Build business analytics dashboard

### 3. **Long-term**
- Add scheduling for business posts
- Implement bulk operations for multiple locations
- Build client management interface for agencies

## Security Best Practices

1. **Never log or expose refresh tokens**
2. **Implement proper error handling for token failures**
3. **Use HTTPS for all OAuth communications**
4. **Regularly audit token usage and permissions**
5. **Implement rate limiting for API calls**

This implementation provides a solid foundation for building a professional Google Business Profile management application that follows industry best practices and security standards.
