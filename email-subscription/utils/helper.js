// src/utils/sesClient.js
const AWS = require('aws-sdk');

const ses = new AWS.SES({
    region: process.env.AWS_REGION || 'ap-south-1'
});

exports.createTemplate = async (template) => {
    try {
        await ses.createTemplate({ Template: template }).promise();
        return { success: true };
    } catch (error) {
        if (error.code === 'AlreadyExists') {
            await ses.updateTemplate({ Template: template }).promise();
            return { success: true, updated: true };
        }
        throw error;
    }
};

exports.sendTemplatedEmail = async (params) => {
    const {
        to,
        from,
        templateName,
        templateData,
        unsubscribeUrl = 'https://example.com/unsubscribe?email=john.doe@example.com',
        unsubscribeEmail = 'gprasad@7edge.com'
    } = params;

    // Construct List-Unsubscribe header
    let listUnsubscribe = [];
    if (unsubscribeUrl) {
        listUnsubscribe.push(`<${unsubscribeUrl}>`);
    }
    if (unsubscribeEmail) {
        listUnsubscribe.push(`<mailto:${unsubscribeEmail}?subject=unsubscribe>`);
    }
    console.log('listUnsubscribe', listUnsubscribe)
    const emailParams = {
        Source: from,
        Destination: {
            ToAddresses: Array.isArray(to) ? to : [to]
        },
        Template: templateName,
        TemplateData: JSON.stringify(templateData),
        ConfigurationSetName: process.env.SES_CONFIGURATION_SET, // Optional: if you have a configuration set
        Headers: [
            {
                Name: 'List-Unsubscribe',
                Value: listUnsubscribe.join(', ')
            },
            {
                Name: 'List-Unsubscribe-Post',
                Value: 'List-Unsubscribe=One-Click'
            }
        ]
    };
    console.log('emailParams', emailParams)
    return ses.sendTemplatedEmail(emailParams).promise();
};

// src/utils/responseHelper.js
exports.formatResponse = (statusCode, body) => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(body)
});