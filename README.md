# AWS SES Email Engine

A serverless email subscription management system built with AWS Lambda, AWS SES (Simple Email Service), and DynamoDB. This service allows you to manage email subscriptions, create email templates, and send templated emails to subscribed users.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This project provides a complete email subscription management system that:

- **Manages Subscriptions**: Users can subscribe and unsubscribe from email lists
- **Template Management**: Create and manage email templates using AWS SES
- **Email Sending**: Send personalized emails to subscribed users with unsubscribe links
- **Compliance**: Includes proper unsubscribe headers for email compliance (CAN-SPAM, GDPR)

## ✨ Features

- ✅ Email subscription management (subscribe/unsubscribe)
- ✅ Email template creation and management
- ✅ Personalized email sending with template data
- ✅ Unsubscribe link support with proper headers
- ✅ DynamoDB-based subscription tracking
- ✅ Serverless architecture (AWS Lambda)
- ✅ RESTful API endpoints
- ✅ Error handling and validation

## 🏗️ Architecture

```
┌─────────────┐
│   Client    │
│  (Browser/  │
│   Mobile)   │
└──────┬──────┘
       │
       │ HTTP Requests
       ▼
┌─────────────────────────────────────┐
│      API Gateway (HTTP API)         │
└──────┬──────────────────────────────┘
       │
       ├──► Subscribe Lambda ──► DynamoDB
       │
       ├──► Unsubscribe Lambda ──► DynamoDB
       │
       ├──► Create Template Lambda ──► AWS SES
       │
       └──► Send Email Lambda ──► AWS SES + DynamoDB
```

### Components

- **AWS Lambda**: Serverless functions for handling requests
- **API Gateway**: HTTP API for REST endpoints
- **DynamoDB**: Stores subscription status and user preferences
- **AWS SES**: Handles email template creation and email sending
- **Serverless Framework**: Infrastructure as code and deployment

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.x or higher)
- **npm** or **yarn** package manager
- **AWS CLI** configured with appropriate credentials
- **Serverless Framework** (`npm install -g serverless`)
- **AWS Account** with:
  - SES service access (may need to request production access)
  - DynamoDB permissions
  - Lambda permissions
  - API Gateway permissions

### AWS SES Setup

1. **Verify your email domain** or email address in AWS SES
2. **Request production access** if you plan to send to unverified emails
3. **Move out of SES Sandbox** (if applicable) to send to any email address

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AWS-SES-EmailEngine
   ```

2. **Navigate to the project directory**
   ```bash
   cd email-subscription
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Install required AWS SDK packages**
   ```bash
   npm install @aws-sdk/client-ses @aws-sdk/lib-dynamodb aws-sdk
   ```

5. **Install Serverless plugins**
   ```bash
   npm install --save-dev serverless-offline
   ```

## ⚙️ Configuration

### Environment Variables

The service uses the following environment variables (configured in `serverless.yml`):

- `SUBSCRIPTIONS_TABLE`: DynamoDB table name (auto-generated based on service and stage)
- `AWS_REGION`: AWS region (default: `ap-south-1`)

### Serverless Configuration

Edit `serverless.yml` to customize:

- **Region**: Change `provider.region` to your preferred AWS region
- **Runtime**: Currently set to `nodejs18.x`
- **Stage**: Default stage is `dev` (can be changed with `--stage` flag)

### IAM Permissions

The service requires the following AWS permissions:

- `ses:*` - Full SES access for template and email operations
- `dynamodb:*` - Full DynamoDB access for subscription management
- `s3:*` - S3 access for deployment bucket

**Note**: For production, consider restricting these permissions to only what's needed.

## 📡 API Endpoints

All endpoints accept and return JSON.

### Base URL

- **Local Development**: `http://localhost:3000`
- **Deployed**: `https://<api-gateway-id>.execute-api.<region>.amazonaws.com/<stage>`

### 1. Subscribe

Subscribe an email address to receive emails.

**Endpoint**: `POST /subscribe`

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Success Response** (200):
```json
{
  "message": "Successfully subscribed",
  "subscription": {
    "email": "user@example.com",
    "isSubscribed": true
  }
}
```

**Error Response** (400):
```json
{
  "error": "Email is required"
}
```

---

### 2. Unsubscribe

Unsubscribe an email address from receiving emails.

**Endpoint**: `POST /unsubscribe`

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Success Response** (200):
```json
{
  "message": "Successfully unsubscribed",
  "email": "user@example.com"
}
```

**Error Response** (400):
```json
{
  "error": "Email is required"
}
```

---

### 3. Create Template

Create or update an email template in AWS SES.

**Endpoint**: `POST /template`

**Request Body**:
```json
{
  "templateName": "welcome"
}
```

**Available Templates**:
- `welcome` - Welcome email template
- `newsletter` - Newsletter template

**Success Response** (200):
```json
{
  "success": true,
  "updated": false
}
```

**Error Response** (400):
```json
{
  "error": "Invalid template name"
}
```

---

### 4. Send Email

Send an email to a subscribed user.

**Endpoint**: `POST /send`

**Request Body**:
```json
{
  "to": "user@example.com",
  "from": "sender@example.com",
  "templateName": "welcome",
  "templateData": {
    "name": "John Doe",
    "email": "user@example.com",
    "accountType": "Premium",
    "customMessage": "Thank you for joining us!"
  },
  "unsubscribeUrl": "https://yourapp.com/unsubscribe?email=user@example.com",
  "unsubscribeEmail": "unsubscribe@example.com"
}
```

**Success Response** (200):
```json
{
  "messageId": "0100018a-f0e1-4b5c-9d6e-1234567890ab-000000",
  "success": true
}
```

**Error Response** (400):
```json
{
  "error": "User is not subscribed"
}
```

**Note**: The email will only be sent if the recipient is subscribed.

## 💡 Usage Examples

### Example 1: Complete Subscription Flow

```bash
# 1. Subscribe a user
curl -X POST https://your-api.com/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com"}'

# 2. Create a template (one-time setup)
curl -X POST https://your-api.com/template \
  -H "Content-Type: application/json" \
  -d '{"templateName": "welcome"}'

# 3. Send a welcome email
curl -X POST https://your-api.com/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "john@example.com",
    "from": "noreply@example.com",
    "templateName": "welcome",
    "templateData": {
      "name": "John",
      "email": "john@example.com",
      "accountType": "Premium",
      "customMessage": "Welcome to our platform!"
    },
    "unsubscribeUrl": "https://yourapp.com/unsubscribe?email=john@example.com",
    "unsubscribeEmail": "unsubscribe@example.com"
  }'

# 4. Unsubscribe
curl -X POST https://your-api.com/unsubscribe \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com"}'
```

### Example 2: JavaScript/Node.js Client

```javascript
const axios = require('axios');

const API_BASE = 'https://your-api.com';

// Subscribe
async function subscribe(email) {
  const response = await axios.post(`${API_BASE}/subscribe`, { email });
  return response.data;
}

// Send welcome email
async function sendWelcomeEmail(userEmail, userName) {
  const response = await axios.post(`${API_BASE}/send`, {
    to: userEmail,
    from: 'noreply@example.com',
    templateName: 'welcome',
    templateData: {
      name: userName,
      email: userEmail,
      accountType: 'Standard',
      customMessage: 'We are excited to have you!'
    },
    unsubscribeUrl: `https://yourapp.com/unsubscribe?email=${userEmail}`,
    unsubscribeEmail: 'unsubscribe@example.com'
  });
  return response.data;
}

// Usage
subscribe('user@example.com')
  .then(() => sendWelcomeEmail('user@example.com', 'John Doe'))
  .then(result => console.log('Email sent:', result))
  .catch(error => console.error('Error:', error));
```

### Example 3: Python Client

```python
import requests

API_BASE = 'https://your-api.com'

# Subscribe
def subscribe(email):
    response = requests.post(
        f'{API_BASE}/subscribe',
        json={'email': email}
    )
    return response.json()

# Send email
def send_email(to_email, from_email, template_data):
    response = requests.post(
        f'{API_BASE}/send',
        json={
            'to': to_email,
            'from': from_email,
            'templateName': 'welcome',
            'templateData': template_data,
            'unsubscribeUrl': f'https://yourapp.com/unsubscribe?email={to_email}',
            'unsubscribeEmail': 'unsubscribe@example.com'
        }
    )
    return response.json()

# Usage
subscribe('user@example.com')
send_email(
    'user@example.com',
    'noreply@example.com',
    {
        'name': 'John Doe',
        'email': 'user@example.com',
        'accountType': 'Premium',
        'customMessage': 'Welcome!'
    }
)
```

## 📁 Project Structure

```
email-subscription/
├── handlers/                 # Lambda function handlers
│   ├── subscribe.js         # Subscribe endpoint handler
│   ├── unsubscribe.js       # Unsubscribe endpoint handler
│   ├── createTemplate.js    # Template creation handler
│   └── sendEmail.js         # Email sending handler
├── templates/                # Email templates
│   ├── welcome.js           # Welcome email template
│   └── newsLetter.js        # Newsletter template
├── utils/                    # Utility functions
│   ├── dynamodb_helper.js   # DynamoDB operations
│   └── helper.js            # SES operations and response formatting
├── serverless.yml            # Serverless framework configuration
└── package.json             # Node.js dependencies
```

### File Descriptions

- **handlers/subscribe.js**: Handles user subscription requests
- **handlers/unsubscribe.js**: Handles user unsubscription requests
- **handlers/createTemplate.js**: Creates/updates email templates in SES
- **handlers/sendEmail.js**: Sends emails to subscribed users
- **templates/welcome.js**: Welcome email template definition
- **templates/newsLetter.js**: Newsletter email template definition
- **utils/dynamodb_helper.js**: DynamoDB client and subscription management functions
- **utils/helper.js**: SES client, template creation, and response formatting utilities

## 🚢 Deployment

### Deploy to AWS

1. **Configure AWS credentials**
   ```bash
   aws configure
   ```

2. **Deploy to development stage**
   ```bash
   serverless deploy
   ```

3. **Deploy to production stage**
   ```bash
   serverless deploy --stage prod
   ```

4. **Deploy a specific function**
   ```bash
   serverless deploy function -f subscribe
   ```

### Local Development

Run the service locally using Serverless Offline:

```bash
serverless offline
```

The API will be available at `http://localhost:3000`

### View Deployment Information

After deployment, you'll see output like:

```
endpoints:
  POST - https://xxxxx.execute-api.ap-south-1.amazonaws.com/subscribe
  POST - https://xxxxx.execute-api.ap-south-1.amazonaws.com/unsubscribe
  POST - https://xxxxx.execute-api.ap-south-1.amazonaws.com/template
  POST - https://xxxxx.execute-api.ap-south-1.amazonaws.com/send
```

## 🔧 Troubleshooting

### Common Issues

#### 1. "Email address not verified" error

**Problem**: AWS SES is in sandbox mode and only allows sending to verified emails.

**Solution**: 
- Verify the recipient email in AWS SES Console
- Or request production access from AWS SES

#### 2. "User is not subscribed" error when sending email

**Problem**: The email address hasn't been subscribed yet.

**Solution**: Call the `/subscribe` endpoint first before sending emails.

#### 3. Template not found error

**Problem**: Template hasn't been created in SES yet.

**Solution**: Call the `/template` endpoint to create the template first.

#### 4. DynamoDB table not found

**Problem**: The table wasn't created during deployment.

**Solution**: 
- Check CloudFormation stack in AWS Console
- Ensure IAM permissions include DynamoDB table creation
- Manually create the table if needed

#### 5. CORS errors in browser

**Problem**: CORS headers might not be properly configured.

**Solution**: The service includes CORS headers, but ensure your API Gateway is configured correctly.

### Debugging

1. **Check CloudWatch Logs**
   ```bash
   serverless logs -f subscribe -t
   ```

2. **View function logs**
   ```bash
   serverless logs -f <function-name> --tail
   ```

3. **Test locally**
   ```bash
   serverless offline
   ```

## 🔒 Security Considerations

1. **Email Verification**: Always verify email addresses before subscribing
2. **Rate Limiting**: Consider adding rate limiting to prevent abuse
3. **Input Validation**: Validate all inputs on the client side as well
4. **IAM Permissions**: Restrict IAM permissions to minimum required
5. **HTTPS**: Always use HTTPS in production
6. **API Keys**: Consider adding API key authentication for production use

## 📝 Email Templates

### Available Templates

#### Welcome Template
- **Variables**: `{{name}}`, `{{email}}`, `{{accountType}}`, `{{customMessage}}`, `{{unsubscribeUrl}}`
- **Use Case**: Welcome new users to your service

#### Newsletter Template
- **Variables**: `{{subject}}`, `{{headline}}`, `{{content}}`, `{{callToAction}}`, `{{unsubscribeUrl}}`
- **Use Case**: Send regular newsletters or updates

### Creating Custom Templates

1. Create a new template file in `templates/` directory
2. Export the template object with required fields
3. Add the template case in `handlers/createTemplate.js`
4. Deploy and create the template via API

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

[Specify your license here]

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Contact: [Your contact information]

## 🔄 Version History

- **v1.0.0**: Initial release with subscription management and email sending

---

**Built with ❤️ using AWS Serverless Architecture**
