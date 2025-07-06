# Quick Gmail App Password Setup Commands

# Step 1: Open Google Account Security directly
Start-Process "https://myaccount.google.com/security"

# Step 2: Try the direct App Passwords link
# Start-Process "https://myaccount.google.com/apppasswords"

# Step 3: Enable 2-Step Verification first if needed
# Start-Process "https://myaccount.google.com/signinoptions/two-step-verification"

# Alternative: Use a different email service for testing
# You can also use services like:
# - Outlook/Hotmail (outlook.com)
# - Yahoo Mail 
# - Or create a new Gmail account specifically for this

Write-Host "Opening Google Account Security page..."
Write-Host "Look for '2-Step Verification' first, then 'App passwords'"
Write-Host ""
Write-Host "If you can't find App Passwords:"
Write-Host "1. Make sure 2-Step Verification is enabled"
Write-Host "2. Try the direct link: https://myaccount.google.com/apppasswords"
Write-Host "3. Wait a few minutes after enabling 2-Step Verification"
Write-Host "4. Try a different browser or incognito mode"
Write-Host ""
Write-Host "Alternatively, you can test the waiver form without email first!"
Write-Host "Just use the waiver-simple.ts file instead."
