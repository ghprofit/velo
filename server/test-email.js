/**
 * AWS SES Email Service Test Script
 *
 * This script tests the email service to ensure AWS SES is configured correctly.
 *
 * Usage:
 *   node test-email.js <recipient-email>
 *
 * Example:
 *   node test-email.js test@example.com
 */

require('dotenv').config();

async function testEmailService() {
  console.log('\n🧪 AWS SES Email Service Test\n');
  console.log('='.repeat(50));

  // Check required environment variables
  console.log('\n1️⃣  Checking Environment Variables...\n');

  const requiredVars = [
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'SES_FROM_EMAIL',
    'SES_FROM_NAME'
  ];

  const missing = [];
  const configured = [];

  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      configured.push(varName);
      console.log(`   ✅ ${varName}: ${varName.includes('SECRET') ? '***' : process.env[varName]}`);
    } else {
      missing.push(varName);
      console.log(`   ❌ ${varName}: NOT SET`);
    }
  });

  if (missing.length > 0) {
    console.log('\n❌ Missing required environment variables:');
    missing.forEach(v => console.log(`   - ${v}`));
    console.log('\n📝 Please configure these in your .env file');
    console.log('📚 See server/src/email/AWS_SES_SETUP.md for setup instructions\n');
    process.exit(1);
  }

  // Get recipient email from command line
  const recipientEmail = process.argv[2];

  if (!recipientEmail) {
    console.log('\n❌ No recipient email provided');
    console.log('\n📝 Usage: node test-email.js <recipient-email>');
    console.log('   Example: node test-email.js test@example.com\n');
    process.exit(1);
  }

  console.log('\n2️⃣  Initializing Email Service...\n');

  try {
    // Dynamic import since we're using CommonJS in test script
    const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

    const sesClient = new SESClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    console.log(`   ✅ SES Client initialized (Region: ${process.env.AWS_REGION})`);

    // Test email parameters
    console.log('\n3️⃣  Sending Test Email...\n');
    console.log(`   📧 From: ${process.env.SES_FROM_NAME} <${process.env.SES_FROM_EMAIL}>`);
    console.log(`   📧 To: ${recipientEmail}`);
    console.log(`   📧 Subject: AWS SES Test Email - VeloLink`);

    const params = {
      Source: `${process.env.SES_FROM_NAME} <${process.env.SES_FROM_EMAIL}>`,
      Destination: {
        ToAddresses: [recipientEmail],
      },
      Message: {
        Subject: {
          Data: 'AWS SES Test Email - VeloLink',
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: `
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                  .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                  .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
                  .info { background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 20px 0; }
                  .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                  code { background: #e9ecef; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>🎉 AWS SES Test Successful!</h1>
                  </div>
                  <div class="content">
                    <div class="success">
                      <strong>✅ Success!</strong> Your AWS SES email service is configured correctly.
                    </div>

                    <h2>Test Details</h2>
                    <ul>
                      <li><strong>Service:</strong> Amazon SES (Simple Email Service)</li>
                      <li><strong>Region:</strong> ${process.env.AWS_REGION}</li>
                      <li><strong>Sender:</strong> ${process.env.SES_FROM_EMAIL}</li>
                      <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
                    </ul>

                    <div class="info">
                      <strong>ℹ️ Next Steps:</strong>
                      <ol>
                        <li>If you're in SES Sandbox mode, verify recipient email addresses in AWS Console</li>
                        <li>Request production access to send to any email address</li>
                        <li>Set up domain authentication (SPF, DKIM, DMARC) for better deliverability</li>
                        <li>Monitor your sending in AWS CloudWatch</li>
                      </ol>
                    </div>

                    <p>Your VeloLink application is ready to send emails! 🚀</p>
                  </div>
                  <div class="footer">
                    <p>This is an automated test email from VeloLink</p>
                    <p>Powered by AWS SES</p>
                  </div>
                </div>
              </body>
              </html>
            `,
            Charset: 'UTF-8',
          },
          Text: {
            Data: `
AWS SES Test Email - VeloLink

✅ Success! Your AWS SES email service is configured correctly.

Test Details:
- Service: Amazon SES (Simple Email Service)
- Region: ${process.env.AWS_REGION}
- Sender: ${process.env.SES_FROM_EMAIL}
- Timestamp: ${new Date().toISOString()}

Next Steps:
1. If you're in SES Sandbox mode, verify recipient email addresses in AWS Console
2. Request production access to send to any email address
3. Set up domain authentication (SPF, DKIM, DMARC) for better deliverability
4. Monitor your sending in AWS CloudWatch

Your VeloLink application is ready to send emails!

---
This is an automated test email from VeloLink
Powered by AWS SES
            `,
            Charset: 'UTF-8',
          },
        },
      },
    };

    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);

    console.log('\n4️⃣  Test Result:\n');
    console.log('   ✅ Email sent successfully!');
    console.log(`   📬 Message ID: ${response.MessageId}`);
    console.log(`   📊 Status Code: ${response.$metadata.httpStatusCode}`);

    console.log('\n' + '='.repeat(50));
    console.log('\n✅ AWS SES EMAIL SERVICE TEST PASSED\n');
    console.log('📧 Check your inbox at:', recipientEmail);
    console.log('⚠️  Note: If in sandbox mode, recipient must be verified in AWS Console\n');
    console.log('📚 Setup Guide: server/src/email/AWS_SES_SETUP.md');
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.log('\n4️⃣  Test Result:\n');
    console.log('   ❌ Email sending failed\n');

    console.error('Error Details:');
    console.error('   Code:', error.code || 'Unknown');
    console.error('   Message:', error.message);

    if (error.code === 'MessageRejected' && error.message.includes('not verified')) {
      console.log('\n💡 Common Issue: Email Address Not Verified');
      console.log('\nYour AWS SES account is in sandbox mode. You need to:');
      console.log('1. Verify the sender email in AWS SES Console');
      console.log('2. Verify the recipient email in AWS SES Console (sandbox only)');
      console.log('3. OR request production access to send to any address\n');
      console.log('📚 See: server/src/email/AWS_SES_SETUP.md for instructions\n');
    } else if (error.code === 'InvalidClientTokenId' || error.code === 'SignatureDoesNotMatch') {
      console.log('\n💡 Common Issue: Invalid AWS Credentials');
      console.log('\nYour AWS credentials are incorrect. Please check:');
      console.log('1. AWS_ACCESS_KEY_ID is correct');
      console.log('2. AWS_SECRET_ACCESS_KEY is correct');
      console.log('3. The IAM user has SES sending permissions\n');
    } else if (error.code === 'ConfigError') {
      console.log('\n💡 Common Issue: Configuration Error');
      console.log('\nPlease check:');
      console.log('1. AWS_REGION is set correctly (e.g., us-east-1)');
      console.log('2. All environment variables are properly configured\n');
    }

    console.log('='.repeat(50) + '\n');
    process.exit(1);
  }
}

// Run the test
testEmailService();
