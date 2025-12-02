const subscriptionManager = require('../utils/dynamodb_helper');
const { SESClient, SendRawEmailCommand } = require('@aws-sdk/client-ses');
const { formatResponse } = require('../utils/helper');

const ses = new SESClient({});

exports.handler = async (event) => {
    try {
        const {
            to,
            from,
            templateName,
            templateData,
            unsubscribeUrl,
            unsubscribeEmail
        } = JSON.parse(event.body);

        // Check subscription status
        const subscription = await subscriptionManager.checkSubscription(to);

        if (!subscription || !subscription.isSubscribed) {
            return formatResponse(400, {
                error: 'User is not subscribed'
            });
        }

        // Render the email body with template data (mocking this for the example)
        const renderedHtml = `<html>
            <body>
                <h1>Welcome ${templateData.name}!</h1>
                <p>Your account details:</p>
                <ul>
                    <li>Email: ${templateData.email}</li>
                    <li>Account Type: ${templateData.accountType}</li>
                </ul>
                <p>${templateData.customMessage}</p>
                <p>
                    <small>
                        Don't want to receive these emails? 
                        <a href="${unsubscribeUrl}">Unsubscribe here</a>
                    </small>
                </p>
            </body>
        </html>`;

        const rawEmail = `From: ${from}
To: ${to}
Subject: Welcome ${templateData.name} to Our Service!
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8
List-Unsubscribe-Post: List-Unsubscribe=One-Click
List-Unsubscribe: <mailto:${unsubscribeEmail}>, <${unsubscribeUrl}>

${renderedHtml}`;

        const params = {
            RawMessage: { Data: rawEmail }
        };

        const command = new SendRawEmailCommand(params);
        const result = await ses.send(command);

        return formatResponse(200, {
            messageId: result.MessageId,
            success: true
        });
    } catch (error) {
        console.error('Error sending email:', error);
        return formatResponse(500, {
            error: 'Failed to send email'
        });
    }
};
