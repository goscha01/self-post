# Google Business Profile API Setup

## Overview
This application connects to **Google Business Profile** (formerly Google My Business) accounts that the user has access to manage. It's designed to:

- **List available business accounts** the user can access
- **Let user select which business** to connect and view
- **Fetch comprehensive business data** including:
  - Business information (name, address, phone, website)
  - Working hours and schedules
  - Services offered
  - Customer reviews and ratings
  - Business posts and updates

## Key Concept: Business Account Access
**Important**: This app doesn't connect to your personal Google profile. Instead, it connects to business profiles that you have been granted access to manage. You need to be:
- **Owner** of the business account
- **Manager** with appropriate permissions
- **Admin** of a Google Workspace organization

## Required Google APIs

### 1. Enable the following APIs in Google Cloud Console:
- **Google My Business Account Management API** - Lists accounts you can access
- **Google My Business Business Information API** - Fetches business details
- **Google My Business Place Actions API** - Gets reviews and posts
- **Google People API** - Additional profile data (optional)

### 2. OAuth Scopes
The application requests these scopes:
- `https://www.googleapis.com/auth/business.manage` - **Primary business scope**
- `https://www.googleapis.com/auth/plus.business.manage` - Legacy business scope
- `profile` - Basic profile information
- `email` - Email address access

### 3. API Setup Steps

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Select your project**
3. **Navigate to "APIs & Services" > "Library"**
4. **Search and enable each API:**
   - `mybusinessaccountmanagement.googleapis.com`
   - `mybusinessbusinessinformation.googleapis.com`
   - `mybusinessplaceactions.googleapis.com`
   - `people.googleapis.com` (optional)

### 4. OAuth Consent Screen
- Update your OAuth consent screen to include the new business scopes
- Users will see a consent screen requesting business profile access
- **Note**: Users must have business account access to see data

## How It Works

### 1. Connection Flow
1. User connects Google account
2. App lists all business accounts they can access
3. User selects which business to view
4. App fetches comprehensive data for selected business

### 2. Expected Data Display
- **Business Account List**: Shows all accessible accounts with roles
- **Selected Business Profile**: 
  - **Basic Info**: Name, rating, contact details, address, phone, website
  - **Working Hours**: Weekly schedule, special hours, holiday hours
  - **Services**: Business categories, detailed services, service areas
  - **Content**: Recent posts (with media), customer reviews with ratings
  - **Business Data**: Categories, labels, attributes, price lists
  - **Analytics**: Post insights, engagement metrics, media counts
  - **Location**: GPS coordinates, location metadata
  - **Technical**: Network Access Token (NAT), API access details

### 3. Fallback Behavior
- If no business accounts exist: Shows informative message
- If APIs not enabled: Business section won't appear
- Graceful degradation for missing data

## Account Types & Data Availability

### 🏢 Business Accounts (Full Data Access)
- **Business owners** with verified Google Business Profile
- **Managers** added to business accounts  
- **Google Workspace admins** with business profiles
- **Agency accounts** managing multiple businesses

**Available Data:**
- ✅ All business information (reviews, posts, services, hours)
- ✅ Business categories, labels, and attributes
- ✅ Location data and coordinates
- ✅ Analytics and insights
- ✅ Network Access Token (NAT)
- ✅ Price lists and detailed services

### 👤 Personal Accounts (Limited Data)
- **Personal Google accounts** without business access
- **Regular users** without management permissions

**Available Data:**
- ❌ No business locations or profiles
- ❌ No reviews, posts, or services
- ❌ No business analytics
- ❌ No NAT or business API access

**What You'll See:**
- Basic profile information only
- Clear message explaining why business data isn't available
- Instructions on how to get business access

## Testing Scenarios

### ✅ Will Work:
- **Business owners** with verified Google Business Profile
- **Managers** added to business accounts
- **Google Workspace admins** with business profiles
- **Agency accounts** managing multiple businesses

### ❌ Won't Work:
- **Personal Google accounts** without business access
- **Regular users** without management permissions
- **Accounts** without enabled APIs

## Troubleshooting

### Common Issues:
1. **"No business accounts found"**: 
   - User doesn't have business profile access
   - Need to be added as manager/owner
   
2. **"API not enabled"**: 
   - Enable required APIs in Google Cloud Console
   
3. **"Access denied"**: 
   - OAuth scopes not properly configured
   - User doesn't have business permissions

### Debug Information:
- Check browser console for API response logs
- Backend logs show business account discovery
- Use "Debug: Raw Profile Data" section

## Security Notes
- **Business data access** is controlled by Google's permission system
- **No business data** is stored permanently (fetched fresh each time)
- **Users must explicitly consent** to business profile access
- **Only authorized users** can see business data they manage
- **Token-based access** ensures proper authorization

## Next Steps
1. **Enable required APIs** in Google Cloud Console
2. **Update OAuth consent screen** with business scopes
3. **Test with business account** you have access to
4. **Verify permissions** and roles for the business account
