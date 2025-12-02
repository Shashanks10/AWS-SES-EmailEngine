const { createTemplate } = require('../utils/helper');
const { formatResponse } = require('../utils/helper');
const { welcomeTemplate } = require('../templates/welcome');
const { newsletterTemplate } = require('../templates/newsLetter');

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const templateName = body.templateName.toLowerCase();
        
        let template;
        switch (templateName) {
            case 'welcome':
                template = welcomeTemplate;
                break;
            case 'newsletter':
                template = newsletterTemplate;
                break;
            default:
                return formatResponse(400, { error: 'Invalid template name' });
        }

        const result = await createTemplate(template);
        return formatResponse(200, result);
    } catch (error) {
        console.error('Error creating template:', error);
        return formatResponse(500, { error: 'Failed to create template' });
    }
};