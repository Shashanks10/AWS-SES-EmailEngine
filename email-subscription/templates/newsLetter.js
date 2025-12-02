exports.newsletterTemplate = {
    TemplateName: 'NewsletterTemplate',
    SubjectPart: '{{subject}}',
    HtmlPart: `
        <html>
            <body style="font-family: Arial, sans-serif;">
                <h1>{{headline}}</h1>
                <div>{{content}}</div>
                <p>{{callToAction}}</p>
                <p>
                    <small>
                        Don't want to receive these emails? 
                        <a href="{{unsubscribeUrl}}">Unsubscribe here</a>
                    </small>
                </p>
            </body>
        </html>
    `,
    TextPart: '{{headline}}\n\n{{content}}\n\n{{callToAction}}'
};