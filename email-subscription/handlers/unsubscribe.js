const subscriptionManager = require('../utils/dynamodb_helper');
const { formatResponse } = require('../utils/helper');

exports.handler = async (event) => {
    try {
        console.log('Received event:', JSON.stringify(event, null, 2))
        const { email } = JSON.parse(event.body);

        if (!email) {
            return formatResponse(400, {
                error: 'Email is required'
            });
        }

        const result = await subscriptionManager.unsubscribe(email);
        
        return formatResponse(200, {
            message: 'Successfully unsubscribed',
            email: result.email
        });
    } catch (error) {
        console.error('Error in unsubscribe handler:', error);
        return formatResponse(500, {
            error: 'Failed to process unsubscribe request'
        });
    }
};