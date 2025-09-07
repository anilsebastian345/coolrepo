# Vercel Environment Variables Setup Guide

## 🔐 Environment Variables Required for Vercel

Add these in your Vercel project settings under "Environment Variables":

### 1. Azure OpenAI (for AI functionality)
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_KEY=your-32-character-key-here
AZURE_OPENAI_DEPLOYMENT=your-gpt-4-deployment-name
AZURE_OPENAI_API_VERSION=2024-02-15-preview

### 2. Google OAuth (for sign-in)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

### 3. NextAuth (for authentication)
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=a-random-32-character-secret-key

## 📝 Steps to set up in Vercel:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable above with your actual values
5. Set Environment to "Production" for main deployment
6. Redeploy your app

## 🔑 How to generate NEXTAUTH_SECRET:
Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32
