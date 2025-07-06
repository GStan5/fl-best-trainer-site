# Google Sheets Integration Setup Guide

## 📊 Overview

Your waiver system now automatically saves client information to a Google Sheets spreadsheet for easy tracking and management.

## 🔧 Setup Steps

### 1. Create a Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "FL Best Trainer - Waiver Tracking" (or your preferred name)
4. Rename the first sheet to "Waivers"

### 2. Set Up Headers

In the first row of your "Waivers" sheet, add these headers:

- **A1**: Date
- **B1**: Time
- **C1**: Name
- **D1**: Email
- **E1**: Phone
- **F1**: Signature Type
- **G1**: IP Address
- **H1**: Waiver Link
- **I1**: Document ID
- **J1**: Status

### 3. Get Your Spreadsheet ID

1. Look at the URL of your spreadsheet
2. Copy the ID from the URL (the long string between `/d/` and `/edit`)
   - Example: `https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit`
   - ID: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

### 4. Update Environment Variables

Add this to your `.env.local` file:

```
GSHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
```

### 5. Share with Service Account

1. In your Google Sheet, click "Share" (top right)
2. Add your service account email (from Google Cloud Console)
3. Give it "Editor" permissions
4. Click "Send"

## 📋 What Gets Tracked

For each waiver submission, the system automatically records:

- **Date & Time**: When the waiver was signed
- **Client Info**: Name, email, phone number
- **Signature Type**: Hand-drawn or typed
- **IP Address**: For legal verification
- **Waiver Link**: Direct link to the PDF in Google Drive
- **Document ID**: Unique identifier for each waiver
- **Status**: Tracking field (defaults to "Active")

## 🔍 Benefits

### For You:

- **Easy Overview**: See all your clients in one place
- **Quick Access**: Click links to view specific waivers
- **Data Export**: Export to Excel or other formats
- **Filtering**: Sort and filter by date, name, etc.
- **Analytics**: Track sign-up patterns and trends

### For Legal Purposes:

- **Complete Records**: All waiver data in one organized location
- **Audit Trail**: IP addresses and timestamps for verification
- **Easy Retrieval**: Quickly find specific waivers when needed

## 🚀 Advanced Features

### Conditional Formatting

You can add conditional formatting to:

- Highlight recent signups
- Color-code different signature types
- Flag any issues or follow-ups needed

### Filters and Sorting

- Filter by date ranges
- Sort by client name
- Group by signature type

### Data Analysis

- Count total waivers signed
- Track monthly/weekly trends
- Monitor IP addresses for security

## 🔧 Troubleshooting

### Common Issues:

1. **"Permission denied"** - Make sure the service account has access to the spreadsheet
2. **"Spreadsheet not found"** - Double-check the spreadsheet ID in your environment variables
3. **"Invalid range"** - Ensure the sheet is named "Waivers" or update the range in the code

### Testing:

1. Submit a test waiver
2. Check the console logs for success messages
3. Verify the data appears in your Google Sheet
4. Click the waiver link to ensure it opens the PDF

## 📞 Support

If you encounter any issues:

1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure the service account has proper permissions
4. Test with a simple waiver submission

Your waiver system now provides complete client tracking and management! 🎉
