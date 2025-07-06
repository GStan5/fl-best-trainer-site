# Google Sheets Troubleshooting Guide

## 📊 Issue: Waiver data not appearing in Google Sheets

### 🔍 Step 1: Check Environment Variables

Make sure your `.env.local` file contains:

```
GDRIVE_CLIENT_EMAIL=your-service-account-email@project.iam.gserviceaccount.com
GDRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...your-private-key...\n-----END PRIVATE KEY-----\n"
GSHEETS_SPREADSHEET_ID=your-spreadsheet-id
```

### 🔍 Step 2: Verify Google Sheets Setup

1. **Check spreadsheet ID**:

   - Open your Google Sheet
   - Copy the ID from the URL: `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`
   - Your current ID: `1lkLvIzX7EVBDRKrbfzNeGz4HMra5s_iQzGaRcCixPkE`

2. **Check sheet name**:

   - Make sure the first sheet is named "Clients" (case sensitive)
   - Or update the range in the code to match your sheet name

3. **Check headers**:
   - Row 1 should have headers: Date, Time, Name, Email, Phone, Signature Type, IP Address, Waiver Link, Document ID, Status

### 🔍 Step 3: Verify Service Account Permissions

1. **Share the spreadsheet**:

   - Click "Share" button in your Google Sheet
   - Add your service account email: `fl-best-trainer-waiver-service@fl-best-trainer-waiver-service.iam.gserviceaccount.com`
   - Give it "Editor" permissions
   - Click "Send"

2. **Check Google Cloud Console**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to "APIs & Services" > "Enabled APIs"
   - Make sure "Google Sheets API" is enabled
   - Make sure "Google Drive API" is enabled

### 🔍 Step 4: Test the Integration

1. **Submit a test waiver**:

   - Go to http://localhost:3000/waiver
   - Fill out the form completely (phone is now required)
   - Submit the waiver

2. **Check console logs**:

   - Look at your terminal where the dev server is running
   - You should see logs like:
     ```
     📊 Attempting to save to Google Sheets...
     📋 Spreadsheet ID: 1lkLvIzX7EVBDRKrbfzNeGz4HMra5s_iQzGaRcCixPkE
     📋 Target range: Clients!A:J
     📋 Row data: [date, time, name, email, phone, ...]
     ✅ Successfully added waiver data to Google Sheets for [Name]
     ```

3. **Check for errors**:
   - Look for any error messages in the console
   - Common errors and solutions:
     - `403 Forbidden`: Service account doesn't have access to the spreadsheet
     - `404 Not Found`: Spreadsheet ID is incorrect or sheet doesn't exist
     - `400 Bad Request`: Sheet name or range is incorrect

### 🔍 Step 5: Manual Test

If the integration still isn't working, try this manual test:

1. **Create a simple test sheet**:

   - Create a new Google Sheet
   - Name it "Test Waiver Tracking"
   - Add the headers in row 1
   - Share it with your service account
   - Get the new spreadsheet ID

2. **Update your `.env.local`** temporarily:

   ```
   GSHEETS_SPREADSHEET_ID=new-test-spreadsheet-id
   ```

3. **Test again** with the new spreadsheet

### 🔍 Step 6: Check API Quotas

- Go to Google Cloud Console > APIs & Services > Quotas
- Make sure you haven't exceeded your Google Sheets API quota
- Default quota is usually 100 requests per 100 seconds per user

### 🔍 Common Solutions

1. **Service Account Email Issues**:

   - Make sure the email in your `.env.local` matches exactly what's in Google Cloud Console
   - Check for typos or extra spaces

2. **Private Key Issues**:

   - Make sure the private key includes `\\n` for line breaks
   - The key should start with `-----BEGIN PRIVATE KEY-----\n` and end with `\n-----END PRIVATE KEY-----\n`

3. **Spreadsheet Access**:

   - The service account must be shared on the specific spreadsheet
   - "Editor" permissions are required, not just "Viewer"

4. **Sheet Name**:
   - The code looks for a sheet named "Clients"
   - Make sure this sheet exists and is spelled correctly

### 🔍 Debug Mode

To get more detailed logs, temporarily add this to your API:

```javascript
console.log("Environment check:");
console.log("GDRIVE_CLIENT_EMAIL:", process.env.GDRIVE_CLIENT_EMAIL);
console.log("GDRIVE_PRIVATE_KEY present:", !!process.env.GDRIVE_PRIVATE_KEY);
console.log("GSHEETS_SPREADSHEET_ID:", process.env.GSHEETS_SPREADSHEET_ID);
```

### 📞 If Nothing Works

1. Double-check all environment variables
2. Verify the service account has proper permissions
3. Try creating a fresh Google Sheet and service account
4. Check the console logs for specific error messages
5. Test with a minimal example first

The most common issue is usually the service account not having access to the spreadsheet!
