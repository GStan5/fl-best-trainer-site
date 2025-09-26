# 🚀 Stripe Setup Guide for FL's Best Personal Trainer

This guide will walk you through setting up Stripe for your fitness platform step-by-step.

## 📋 Prerequisites

- You have created a Stripe account at https://dashboard.stripe.com
- You have access to your project's `.env.local` file

---

## 🔑 Step 1: Get Your Stripe API Keys

### 1.1 Login to Stripe Dashboard

1. Go to https://dashboard.stripe.com
2. Login with your Stripe account credentials

### 1.2 Make Sure You're in Test Mode

1. **IMPORTANT**: In the top-left corner, you'll see a toggle switch
2. Make sure it says **"Test mode"** (not "Live mode")
3. The toggle should be **ON** (blue) for testing
4. This ensures you won't charge real money during development

### 1.3 Navigate to API Keys

1. In the left sidebar, click **"Developers"**
2. Click **"API keys"** from the dropdown menu
3. You should now see your API keys page

### 1.4 Copy Your Keys

You'll see two types of keys:

#### Publishable Key

- Starts with `pk_test_`
- This is **safe to expose** in your frontend code
- Click **"Reveal test key"** if it's hidden
- **Copy this entire key** (including `pk_test_`)

#### Secret Key

- Starts with `sk_test_`
- This is **SENSITIVE** - never expose this in frontend code
- Click **"Reveal test key"** if it's hidden
- **Copy this entire key** (including `sk_test_`)

---

## ⚙️ Step 2: Add Keys to Your Environment File

### 2.1 Open Your Project

1. Navigate to your project folder: `C:\Users\Gavin\Desktop\fl-best-trainer-site`
2. Look for a file called `.env.local`
3. If it doesn't exist, create a new file called `.env.local`

### 2.2 Add Your Stripe Keys

Add these lines to your `.env.local` file:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE

# Your domain for redirects
NEXT_PUBLIC_DOMAIN=http://localhost:3001
```

### 2.3 Replace the Placeholders

- Replace `pk_test_YOUR_PUBLISHABLE_KEY_HERE` with your actual publishable key
- Replace `sk_test_YOUR_SECRET_KEY_HERE` with your actual secret key

**Example of what it should look like:**

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abcdefghijklmnopqrstuvwxyz
STRIPE_SECRET_KEY=sk_test_51234567890abcdefghijklmnopqrstuvwxyz
NEXT_PUBLIC_DOMAIN=http://localhost:3001
```

---

## 🔗 Step 3: Set Up Webhook (For Production Later)

_Note: You can skip this step for now if you're just testing. This is needed when you go live._

### 3.1 Create Webhook Endpoint

1. In Stripe Dashboard, go to **"Developers"** → **"Webhooks"**
2. Click **"Add endpoint"**
3. Enter your endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Select these events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
5. Click **"Add endpoint"**

### 3.2 Get Webhook Secret

1. After creating the webhook, click on it
2. In the **"Signing secret"** section, click **"Reveal"**
3. Copy the webhook secret (starts with `whsec_`)
4. Add it to your `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

---

## 🧪 Step 4: Test Your Integration

### 4.1 Restart Your Development Server

1. Stop your current server (Ctrl+C in terminal)
2. Run `npm run dev` again
3. Go to http://localhost:3001/account

### 4.2 Test a Purchase

1. Make sure you're logged in
2. Click on a "Buy" button for any package
3. You'll be redirected to Stripe's checkout page
4. Use Stripe's test card numbers:

#### Test Card Numbers

- **Successful payment**: `4242 4242 4242 4242`
- **Declined payment**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`

#### Test Card Details

- **Expiry**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)
- **Name**: Any name
- **Address**: Any address

### 4.3 What Should Happen

1. ✅ Payment processes successfully
2. ✅ You're redirected back to your account page
3. ✅ Success message appears
4. ✅ Sessions are added to your account
5. ✅ Purchase appears in your purchase history

---

## 🚨 Common Issues & Solutions

### Issue 1: "Stripe is not properly configured"

**Solution**: Make sure your `.env.local` file has the correct variable names and your keys are properly formatted.

### Issue 2: Payment goes through but sessions aren't added

**Solution**: Check that your webhook is working or the success redirect is functioning properly.

### Issue 3: "Invalid API Key"

**Solution**:

- Make sure you copied the entire key including `pk_test_` or `sk_test_`
- Make sure you're in test mode in Stripe dashboard
- Restart your development server after adding keys

### Issue 4: Checkout page doesn't open

**Solution**:

- Check browser console for errors
- Make sure your publishable key is correct
- Ensure you're logged in to the application

---

## 📞 Need Help?

If you run into any issues:

1. **Check the browser console** (F12 → Console tab) for error messages
2. **Check your terminal** where npm run dev is running for server errors
3. **Verify your keys** are correctly copied and pasted
4. **Make sure** you're in Stripe test mode

---

## 🔐 Security Notes

- ✅ **Never** commit your `.env.local` file to git
- ✅ **Never** share your secret key publicly
- ✅ Always use test mode during development
- ✅ The publishable key is safe to use in frontend code

---

## 🚀 Going Live (When Ready)

When you're ready to accept real payments:

1. Switch to **Live mode** in Stripe Dashboard
2. Get your **live API keys** (they'll start with `pk_live_` and `sk_live_`)
3. Update your `.env.local` with live keys
4. Set up webhooks with your production domain
5. Update `NEXT_PUBLIC_DOMAIN` to your live domain

---

**🎉 That's it! Your Stripe integration should now be working perfectly.**
