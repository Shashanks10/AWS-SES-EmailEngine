// src/utils/dynamoClient.js
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { 
    DynamoDBDocumentClient, 
    PutCommand, 
    GetCommand, 
    UpdateCommand 
} = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'ap-south-1' });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.SUBSCRIPTIONS_TABLE;

const subscriptionManager = {
    // Add or update subscription
    async subscribe(email) {
        const params = {
            TableName: TABLE_NAME,
            Item: {
                email: email,
                isSubscribed: true,
                updatedAt: new Date().toISOString()
            }
        };

        try {
            await docClient.send(new PutCommand(params));
            return { email, isSubscribed: true };
        } catch (error) {
            console.error('Error subscribing:', error);
            throw error;
        }
    },

    // Check subscription status
    async checkSubscription(email) {
        console.log('TABLE_NAME', TABLE_NAME)
        const params = {
            TableName: TABLE_NAME,
            Key: { email }
        };

        try {
            const response = await docClient.send(new GetCommand(params));
            return response.Item;
        } catch (error) {
            console.error('Error checking subscription:', error);
            throw error;
        }
    },

    // Unsubscribe
    async unsubscribe(email) {
        const params = {
            TableName: TABLE_NAME,
            Key: { email },
            UpdateExpression: 'SET isSubscribed = :status, updatedAt = :timestamp',
            ExpressionAttributeValues: {
                ':status': false,
                ':timestamp': new Date().toISOString()
            },
            ReturnValues: 'ALL_NEW'
        };

        try {
            const response = await docClient.send(new UpdateCommand(params));
            return response.Attributes;
        } catch (error) {
            console.error('Error unsubscribing:', error);
            throw error;
        }
    }
};

module.exports = subscriptionManager;