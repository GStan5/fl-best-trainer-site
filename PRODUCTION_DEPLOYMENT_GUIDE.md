# Production Deployment Checklist for https://www.flbesttrainer.com/

## ✅ Environment Variables Updated

Your `.env.local` and `.env.production` files have been configured for production deployment.

## 🔧 Critical Actions Required Before Going Live:

### 1. Google OAuth Configuration

**IMPORTANT**: Update your Google OAuth app to include production URLs:

- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Navigate to APIs & Services → Credentials
- Edit your OAuth 2.0 Client ID
- Add these Authorized Redirect URIs:
  - `https://www.flbesttrainer.com/api/auth/callback/google`
  - `https://flbesttrainer.com/api/auth/callback/google` (without www)
- Add Authorized JavaScript origins:
  - `https://www.flbesttrainer.com`
  - `https://flbesttrainer.com`

### 2. Stripe Configuration

**Current Status**: Using TEST keys (safe for testing)
**Action Required**: When ready for real payments, replace with LIVE keys:

```bash
# Replace these in your production environment:
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... # Your live publishable key
STRIPE_SECRET_KEY=sk_live_... # Your live secret key
```

### 3. Domain Configuration

✅ Updated to: `https://www.flbesttrainer.com`
✅ NextAuth URL configured for production
✅ All localhost references removed

### 4. Database Configuration

✅ Using Neon PostgreSQL (production-ready)
✅ SSL mode enabled
✅ Connection pooling configured

### 5. Email Configuration

✅ Gmail SMTP configured and ready for production

### 6. Google Drive & Sheets

✅ Service account credentials configured
✅ Production-ready for waiver management

## 🚀 Deployment Steps:

### If deploying to Vercel:

1. Connect your GitHub repository to Vercel
2. Add all environment variables from `.env.production` to Vercel dashboard
3. Deploy from main branch

### If deploying to other platforms:

1. Copy `.env.production` to your server as `.env.local`
2. Run `npm run build` to create production build
3. Run `npm start` to start production server

## 🔒 Security Notes:

1. **Never commit `.env.local` or `.env.production` to git**
2. **Update NEXTAUTH_SECRET** for production (use a longer, more secure string)
3. **Enable HTTPS** (already configured in URLs)
4. **Consider rotating database password** after going live

## 📋 Testing Checklist:

Before going live, test these features:

- [ ] User authentication (Google OAuth)
- [ ] Class booking system
- [ ] Email notifications
- [ ] Waiver system (Google Drive integration)
- [ ] Admin functionality
- [ ] Mobile responsiveness
- [ ] Payment processing (when using live Stripe keys)

## 🔧 Current Configuration Status:

✅ **Ready for Production**:

- Domain URLs updated
- Database configured
- Authentication configured
- Email system ready
- Google integrations ready

⚠️ **Requires Action**:

- Update Google OAuth redirect URLs
- Switch to live Stripe keys when ready for payments
- Test all functionality on production domain

## 📞 Support:

If you encounter issues:

1. Check Vercel/hosting platform logs
2. Verify all environment variables are set correctly
3. Ensure Google OAuth URLs are updated
4. Test database connectivity

Your application is now configured for production deployment! 🎉
