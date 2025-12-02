const subscriptionManager = require('../utils/dynamoClient');
const { formatResponse } = require('../utils/responseHelper');

exports.handler = async (event) => {
    try {
        const { email } = JSON.parse(event.body);

        if (!email) {
            return formatResponse(400, {
                error: 'Email is required'
            });
        }

        const result = await subscriptionManager.subscribe(email);
        
        return formatResponse(200, {
            message: 'Successfully subscribed',
            subscription: result
        });
    } catch (error) {
        console.error('Error in subscribe handler:', error);
        return formatResponse(500, {
            error: 'Failed to process subscription'
        });
    }
};