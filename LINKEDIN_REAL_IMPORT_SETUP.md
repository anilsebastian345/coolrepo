# Real LinkedIn Import Setup Guide

To import actual user LinkedIn data, you need to set up LinkedIn OAuth authentication. Here's how:

## Step 1: Create a LinkedIn Developer App

1. **Go to LinkedIn Developer Portal**
   - Visit: https://www.linkedin.com/developers/
   - Sign in with your LinkedIn account

2. **Create a New App**
   - Click "Create App"
   - Fill out the form:
     - **App name**: "Sage AI Coach" (or your app name)
     - **LinkedIn Page**: Your company's LinkedIn page
     - **Privacy policy URL**: Your privacy policy URL
     - **App logo**: Upload your app logo
   - Click "Create app"

3. **Configure OAuth Settings**
   - Go to the "Auth" tab in your app dashboard
   - Add these redirect URLs:
     - Development: `http://localhost:3000/api/auth/callback/linkedin`
     - Production: `https://yourdomain.com/api/auth/callback/linkedin`

4. **Get Your Credentials**
   - Copy the **Client ID** and **Client Secret** from the Auth tab

## Step 2: Request API Permissions

1. **In the "Products" tab**, request access to:
   - ✅ **Sign In with LinkedIn using OpenID Connect** (for basic auth)
   - ✅ **Profile API** (for profile data - requires approval)
   - ✅ **W3C LinkedIn Network API** (if available)

2. **Important Notes:**
   - Basic profile access is usually granted immediately
   - Extended profile data may require LinkedIn review/approval
   - Some APIs have usage limits

## Step 3: Update Environment Variables

Replace the placeholders in your `.env.local` file:

```env
# LinkedIn OAuth Configuration
LINKEDIN_CLIENT_ID=78xyz123456789  # Your actual Client ID
LINKEDIN_CLIENT_SECRET=abcdef123456789  # Your actual Client Secret
```

## Step 4: Available LinkedIn Data

With proper permissions, you can access:

### ✅ **Immediately Available (Basic Profile):**
- Name (first and last)
- Email address
- Profile picture
- Basic headline

### 🔒 **Requires Approval (Extended Profile):**
- Detailed work experience
- Education history
- Skills and endorsements
- Professional summary
- Industry information
- Location details

### ❌ **Not Available via API:**
- Recommendations (requires special partnership)
- Full contact information
- Private messaging
- Connection lists

## Step 5: Testing the Integration

1. **Start your development server**: `npm run dev`

2. **Navigate to your app**: `http://localhost:3000`

3. **Click "Import LinkedIn info"**:
   - If not authenticated with LinkedIn → prompts to sign in
   - If authenticated → fetches real LinkedIn data
   - If API fails → falls back to sample data

4. **Check the results**:
   - Success message shows data source (LinkedIn API vs Sample)
   - Data saved to `linkedin_imports/` directory
   - Form fields populated automatically

## Step 6: Current Implementation Status

### ✅ **What Works Now:**
- LinkedIn OAuth authentication flow
- Automatic fallback to sample data if API fails
- Text file storage with timestamps
- Form auto-population
- Error handling and user feedback

### 🔄 **API Integration:**
- Uses LinkedIn API v2 endpoints
- Graceful fallback to sample data
- Proper error handling
- Access token management

### 📋 **Data Collected:**
```javascript
{
  name: "User's full name",
  headline: "Professional headline",
  summary: "About/summary section", 
  industry: "Industry classification",
  location: "Geographic location",
  positions: [/* Work experience */],
  educations: [/* Education history */]
}
```

## Step 7: Production Deployment

1. **Update redirect URLs** in LinkedIn app to include production domain
2. **Set production environment variables** with real credentials
3. **Test OAuth flow** on production environment
4. **Monitor API usage** in LinkedIn Developer Portal

## Troubleshooting

### Common Issues:

1. **"Invalid redirect URI"**
   - Check LinkedIn app settings match your URLs exactly
   - Ensure correct port (3000 vs 3001)

2. **"Application does not have access"**
   - Verify you've requested proper LinkedIn products
   - Some APIs require manual approval from LinkedIn

3. **"Access token expired"**
   - Tokens expire after 60 days
   - Implement token refresh logic for production

4. **API rate limits**
   - LinkedIn has daily/hourly rate limits
   - Implement proper error handling and retry logic

### Debug Mode:
Add to `.env.local` for detailed OAuth logs:
```env
NEXTAUTH_DEBUG=true
```

## Security Notes

- ✅ Never commit LinkedIn credentials to version control
- ✅ Use environment variables for all sensitive data
- ✅ Implement proper scope limitations
- ✅ Monitor API usage and costs
- ✅ Follow LinkedIn's terms of service

## Alternative Approach: Public Profile Scraping

If LinkedIn API approval is difficult, consider:
1. **User provides LinkedIn profile URL**
2. **Extract publicly visible information**
3. **Parse standard LinkedIn profile structure**

This requires users to have public profiles and is less reliable but doesn't require API approval.

---

**Current Status**: The integration is code-complete and will work immediately once you add real LinkedIn credentials. It gracefully falls back to sample data if the API is unavailable.