# Waiver Form Setup Guide

This guide will help you set up the waiver form to work with your Gmail account and optionally Google Drive.

## Gmail Setup (Required)

### Step 1: Enable 2-Factor Authentication

1. Go to your Gmail account settings
2. Enable 2-Factor Authentication if not already enabled

### Step 2: Create App Password

1. Go to [Google Account Settings](https://myaccount.google.com)
2. Click "Security" in the left sidebar
3. Look for "2-Step Verification" and click on it
4. Scroll down to find "App passwords" (it may be at the bottom)
5. Click "App passwords"
6. If you don't see "App passwords":
   - Make sure 2-Step Verification is enabled first
   - Try this direct link: https://myaccount.google.com/apppasswords
7. Select "Mail" as the app and "Other (custom name)" as the device
8. Enter "FL Best Trainer Website" as the device name
9. Click "Generate"
10. Copy the 16-character app password (save this securely)

**Alternative Method if App Passwords is not visible:**

1. Go directly to: https://myaccount.google.com/apppasswords
2. If it says "App passwords aren't available for your account", you may need to:
   - Enable 2-Step Verification first
   - Wait a few minutes after enabling 2-Step Verification
   - Try using a different browser or incognito mode

### Step 3: Update Environment Variables

Update your `.env.local` file with:

```bash
GMAIL_USER=your-gmail-address@gmail.com
GMAIL_PASS=your-16-character-app-password
```

## Alternative Gmail Setup (If App Passwords Don't Work)

If you can't find App Passwords or they're not working, you can use OAuth2 instead:

### Step 1: Enable "Less secure app access" (Not Recommended)

⚠️ **Warning**: This method is less secure and may be deprecated by Google.

1. Go to your Gmail account settings
2. Click "Security"
3. Enable "Less secure app access" (if available)
4. Use your regular Gmail password in the environment variables

### Step 2: Use OAuth2 (Recommended Alternative)

This is more complex but more secure. If you need help with OAuth2 setup, let me know.

## Google Drive Setup (Optional)

If you want to save waivers to Google Drive:

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the Google Drive API

### Step 2: Create Service Account

1. Go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Enter name: "FL Best Trainer Waiver Service"
4. Create and download the JSON key file

### Step 3: Set Up Drive Folder

1. Create a folder in your Google Drive called "Waivers"
2. Right-click the folder and click "Share"
3. Add the service account email (from the JSON file) with "Editor" permissions
4. Copy the folder ID from the URL (the part after `/folders/`)

### Step 4: Update Environment Variables

Add these to your `.env.local`:

```bash
GDRIVE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GDRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key from JSON\n-----END PRIVATE KEY-----"
GDRIVE_FOLDER_ID=your-google-drive-folder-id
```

## Testing the Setup

### Local Testing

1. Run `npm run dev`
2. Navigate to `http://localhost:3000/waiver`
3. Fill out and submit the form
4. Check your Gmail for the waiver notification

### Production Testing

1. Add the same environment variables to your Vercel project:
   - Go to your Vercel dashboard
   - Select your project
   - Go to "Settings" > "Environment Variables"
   - Add each variable

## Troubleshooting

### Common Issues:

1. **Gmail authentication fails**: Make sure you're using an app password, not your regular Gmail password
2. **Google Drive saves fail**: Check that the service account has access to the folder
3. **Private key formatting**: Ensure the private key includes `\n` characters for line breaks

### Error Messages:

- "Invalid credentials": Check your Gmail app password
- "Access denied": Verify Google Drive folder permissions
- "Network error": Check your internet connection and API limits

## Features

The waiver form now includes:

- ✅ Form validation
- ✅ Loading states
- ✅ Error handling
- ✅ Email notifications (to you and the user)
- ✅ Optional Google Drive storage
- ✅ Responsive design
- ✅ Proper JSX structure

## Next Steps

1. Set up your Gmail app password
2. Update the environment variables
3. Test the form locally
4. Deploy to production
5. Add environment variables to Vercel
6. Test the live version

The waiver form is now ready to collect liability waivers from your clients!
