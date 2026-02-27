# Environment Variables Setup Guide

## Overview
To enable the password reset functionality with email sending on RayProxy Hub, you need to configure the following environment variables.

## Required Environment Variables

### 1. Email Service - Resend API (Recommended)

The forgot password feature uses **Resend** for sending reset code emails.

```
RESEND_API_KEY=your_resend_api_key_here
```

### How to Get Your Resend API Key:

1. **Create a Resend Account**
   - Visit https://resend.com
   - Sign up for a free account (includes free tier with 100 emails/day)

2. **Generate API Key**
   - After logging in, go to API Keys section
   - Create a new API key
   - Copy the key

3. **Add to Your Environment Variables**
   - If deploying on Vercel:
     - Go to your project settings > Environment Variables
     - Add key: `RESEND_API_KEY`
     - Add value: `your_api_key_from_resend`
     - Redeploy your project
   
   - If running locally:
     - Create or edit `.env.local` in your project root
     - Add: `RESEND_API_KEY=your_api_key_from_resend`
     - Restart your development server

## Current Implementation

The forgot password flow currently:

1. **User submits email** - User enters their email on the forgot-password page
2. **User validation** - The system checks if the user exists in the database
3. **Error handling** - If user not found, returns error: "User not found. Please check your email address."
4. **Code generation** - If user exists, a 6-digit reset code is generated
5. **Email sending** - Reset code is sent via Resend email service
6. **Code verification** - User verifies the code from their email
7. **Password reset** - User sets a new password

## Code Flow

### Step 1: Send Reset Code
```
POST /api/auth/forgot-password
Body: { email, action: "send-code" }

Response:
- Success: { success: true }
- User not found: { error: "User not found. Please check your email address.", status: 404 }
- Email send failed: { error: "Failed to send reset code. Please try again later.", status: 500 }
```

### Step 2: Verify Reset Code
```
POST /api/auth/forgot-password
Body: { email, code, action: "verify-code" }

Response:
- Success: { success: true }
- Invalid code: { error: "Invalid reset code", status: 400 }
- Expired code: { error: "Reset code has expired", status: 400 }
```

### Step 3: Reset Password
```
POST /api/auth/forgot-password
Body: { email, code, password, action: "reset-password" }

Response:
- Success: { success: true }
- Invalid request: { error: "Invalid reset request", status: 400 }
- Expired code: { error: "Reset code has expired", status: 400 }
```

## Important Notes

1. **API Key Security**
   - Never commit your API key to version control
   - Always use environment variables
   - Regenerate keys if compromised

2. **Reset Code Expiry**
   - Reset codes expire after 30 minutes
   - Users must verify within this timeframe
   - Codes are one-time use

3. **Email Domain**
   - Resend will provide you with a default domain (e.g., onboarding@resend.dev)
   - You can configure custom domains in Resend settings
   - Currently configured to send from: noreply@raypoxyhub.com

4. **Testing**
   - Use Resend's test mode for development
   - Check Resend dashboard for email delivery status
   - Use your own email for testing

## Alternative Email Services

If you want to use a different email service, here are other options:

### SendGrid
- Free tier: 100 emails/day
- Paid: $19.95+/month
- Get API key from: https://app.sendgrid.com/settings/api_keys

### Mailgun
- Free tier: 5,000 emails/month
- Get API key from: https://app.mailgun.com/app/account/security/api_keys

### AWS SES
- Very affordable: $0.10 per 1,000 emails
- Requires AWS account: https://aws.amazon.com/ses/

### Gmail SMTP
- Free with Gmail account
- Use App Passwords (requires 2FA)
- Configuration: 
  - Host: smtp.gmail.com
  - Port: 587
  - User: your-email@gmail.com
  - Password: app-specific password

## Troubleshooting

### Issue: "RESEND_API_KEY is undefined"
- Solution: Check that you've added the environment variable correctly
- Verify in Vercel project settings or .env.local
- Restart your application after adding the variable

### Issue: "Failed to send reset code"
- Solution: Verify your API key is correct
- Check Resend dashboard for email logs
- Ensure email is in correct format
- Check rate limits if sending many emails

### Issue: Email not received
- Solution: Check spam/junk folder
- Verify recipient email address
- Check Resend dashboard for delivery status
- Try resending after a delay

## Next Steps

1. ✅ Create Resend account
2. ✅ Generate API key
3. ✅ Add RESEND_API_KEY to environment variables
4. ✅ Redeploy your application
5. ✅ Test password reset flow
6. ✅ Verify emails are being received

## Support

If you need help setting up environment variables or debugging email issues:
- Check the Support page for contact information
- Review application logs for error messages
- Contact Resend support for email delivery issues
