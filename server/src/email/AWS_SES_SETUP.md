# AWS SES Setup Guide

This guide will help you set up Amazon Simple Email Service (AWS SES) for the VeloLink email service.

## Prerequisites

- AWS Account (free tier available)
- AWS CLI installed (optional, but recommended)
- Access to create IAM users

## Step 1: Sign in to AWS Console

1. Go to [AWS Console](https://aws.amazon.com/console/)
2. Sign in with your AWS account
3. Navigate to **Amazon SES** service

## Step 2: Verify Your Email Address

Before you can send emails, you must verify your sender email address:

1. In the AWS SES console, go to **"Verified identities"**
2. Click **"Create identity"**
3. Select **"Email address"**
4. Enter your sender email (e.g., `josephkuttor730@gmail.com`)
5. Click **"Create identity"**
6. Check your inbox for a verification email from AWS
7. Click the verification link in the email

**Important:** You must verify the email address you'll use as `SES_FROM_EMAIL`

## Step 3: Request Production Access (Remove Sandbox Limitations)

By default, AWS SES starts in **sandbox mode**, which means:
- You can only send emails to verified email addresses
- You have a limit of 200 emails per day
- Maximum send rate of 1 email per second

To remove these limitations:

1. In AWS SES console, go to **"Account dashboard"**
2. Look for the banner about sandbox mode
3. Click **"Request production access"**
4. Fill out the form:
   - **Mail type**: Select "Transactional"
   - **Website URL**: Enter your website URL
   - **Use case description**: Describe your application (e.g., "Sending transaction emails for a digital content platform including purchase receipts, email verification, and password resets")
   - **Describe how you handle bounces and complaints**: "We monitor bounce and complaint rates through AWS SES console and handle unsubscribe requests"
   - **Will you comply with AWS Service Terms**: Yes
5. Submit the request

**Processing time**: Usually 24-48 hours. You'll receive an email when approved.

## Step 4: Create IAM User for Programmatic Access

1. Go to **IAM** service in AWS Console
2. Click **"Users"** → **"Create user"**
3. Enter a username (e.g., `velolink-ses-user`)
4. Click **"Next"**
5. Select **"Attach policies directly"**
6. Search for and select **"AmazonSESFullAccess"**
7. Click **"Next"** → **"Create user"**
8. Go back to **Users** list and click on your new user
9. Go to **"Security credentials"** tab
10. Click **"Create access key"**
11. Select **"Application running on AWS compute service"** or **"Other"**
12. Click **"Next"** → **"Create access key"**
13. **IMPORTANT**: Save your credentials:
    - **Access Key ID**: Copy this value
    - **Secret Access Key**: Copy this value (you won't be able to see it again!)

## Step 5: Configure Environment Variables

Update your `.env` file with the AWS SES credentials:

```env
# AWS SES Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id-from-step-4
AWS_SECRET_ACCESS_KEY=your-secret-access-key-from-step-4

# Email Configuration
SES_FROM_EMAIL=josephkuttor730@gmail.com
SES_FROM_NAME=VeloLink
SES_REPLY_TO_EMAIL=josephkuttor730@gmail.com
```

**Important Notes:**
- Replace `your-access-key-id-from-step-4` with the actual Access Key ID
- Replace `your-secret-access-key-from-step-4` with the actual Secret Access Key
- Use the email address you verified in Step 2 for `SES_FROM_EMAIL`
- Choose the AWS region closest to your users or server

## Step 6: Test Your Configuration

### Option A: Using the Test Script (Recommended)

Run the standalone test script to verify your AWS SES configuration:

```bash
cd server
node test-email.js your-email@example.com
```

Replace `your-email@example.com` with:
- Any email address (if you have production access)
- A verified email address (if still in sandbox mode)

The test script will:
- ✅ Verify all environment variables are set
- ✅ Initialize the SES client
- ✅ Send a beautifully formatted test email
- ✅ Provide detailed error messages if something goes wrong

### Option B: Using the API Endpoint

Alternatively, test via the API endpoint:

```bash
# Start your server
npm run start:dev

# In another terminal, test the email service
curl -X POST http://localhost:8000/email/test \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "your-email@example.com"}'
```

You should receive a test email within seconds!

## Step 7: Configure Sending Limits (Optional)

By default, new AWS accounts have limits:
- **Daily sending quota**: 200 emails/day (sandbox), higher in production
- **Maximum send rate**: 1 email/second (sandbox), higher in production

To check or request increase:
1. Go to **AWS SES console** → **"Account dashboard"**
2. View your current sending limits
3. If you need higher limits, click **"Request an increase"**
4. Fill out the form with your requirements

## Step 8: Set Up Domain Authentication (Recommended)

For better deliverability and to avoid spam filters:

1. In AWS SES console, go to **"Verified identities"**
2. Click **"Create identity"**
3. Select **"Domain"**
4. Enter your domain (e.g., `velolink.com`)
5. Enable **DKIM signing** (recommended)
6. Click **"Create identity"**
7. AWS will provide DNS records (DKIM, SPF, DMARC)
8. Add these DNS records to your domain's DNS settings
9. Wait for verification (can take up to 72 hours)

**Benefits:**
- Higher email deliverability
- Better sender reputation
- Reduced chance of emails going to spam
- Professional appearance

## AWS Regions

AWS SES is available in multiple regions. Choose the region closest to your users:

| Region | Region Code | Location |
|--------|-------------|----------|
| US East (N. Virginia) | us-east-1 | Virginia, USA |
| US West (Oregon) | us-west-2 | Oregon, USA |
| Europe (Ireland) | eu-west-1 | Ireland |
| Europe (Frankfurt) | eu-central-1 | Frankfurt, Germany |
| Asia Pacific (Sydney) | ap-southeast-2 | Sydney, Australia |
| Asia Pacific (Mumbai) | ap-south-1 | Mumbai, India |

## Monitoring and Best Practices

### Monitor Your Sending

1. Go to AWS SES console → **"Reputation metrics"**
2. Monitor:
   - **Bounce rate**: Should be < 5%
   - **Complaint rate**: Should be < 0.1%
   - **Sending quota usage**: Track daily usage

### Set Up CloudWatch Alarms (Optional)

1. Go to **CloudWatch** → **"Alarms"**
2. Create alarms for:
   - High bounce rate
   - High complaint rate
   - Sending quota approaching limit

### Handle Bounces and Complaints

Set up SNS notifications:
1. AWS SES console → **"Configuration sets"**
2. Create a configuration set
3. Add SNS topics for bounces and complaints
4. Subscribe to these topics to receive notifications

## Troubleshooting

### Error: "Email address is not verified"
**Solution**: Verify the sender email address in AWS SES console (Step 2)

### Error: "Sandbox restriction"
**Solution**: Request production access (Step 3) or use a verified recipient email

### Error: "Invalid credentials"
**Solution**: Double-check your AWS Access Key ID and Secret Access Key in `.env`

### Error: "Rate exceeded"
**Solution**:
- In sandbox: Wait or request production access
- In production: Request sending limit increase

### Email not received
**Check:**
1. Spam/junk folder
2. AWS SES console → **"Suppression list"** (recipient may be blocked)
3. CloudWatch logs for delivery status
4. SES reputation metrics

## Cost

AWS SES Pricing (as of 2024):
- **First 62,000 emails/month**: FREE (when sent from EC2)
- **First 1,000 emails/month**: FREE (when sent from other AWS services)
- **After free tier**: $0.10 per 1,000 emails
- **Attachments**: $0.12 per GB

**Example costs:**
- 10,000 emails/month: ~$0-$1
- 100,000 emails/month: ~$10
- 1 million emails/month: ~$100

Much cheaper than most email service providers!

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use IAM roles** instead of access keys when running on AWS
3. **Rotate access keys** regularly
4. **Use least-privilege policies** (only grant SES permissions)
5. **Enable MFA** on your AWS account
6. **Monitor CloudTrail logs** for suspicious activity

## Next Steps

✅ AWS SES configured
✅ Email verified
✅ Production access requested
✅ Credentials stored in `.env`
✅ Test email sent successfully

Now you're ready to send emails with AWS SES!

For more information:
- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
- [AWS SES Best Practices](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/best-practices.html)
- [AWS SES Pricing](https://aws.amazon.com/ses/pricing/)
