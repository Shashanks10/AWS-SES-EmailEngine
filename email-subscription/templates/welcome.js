exports.welcomeTemplate = {
    TemplateName: 'WelcomeTemplate',
    SubjectPart: 'Welcome {{name}} to Our Service!',
    HtmlPart: `
        <html>
            <body style="font-family: Arial, sans-serif;">
                <h1>Welcome {{name}}!</h1>
                <p>We're excited to have you join us.</p>
                <p>Your account details:</p>
                <ul>
                    <li>Email: {{email}}</li>
                    <li>Account Type: {{accountType}}</li>
                </ul>
                <p>{{customMessage}}</p>
                <p>
                    <small>
                        Don't want to receive these emails? 
                        <a href="{{unsubscribeUrl}}">Unsubscribe here</a>
                    </small>
                </p>
            </body>
        </html>
    `,
    TextPart: 'Welcome {{name}}! We\'re excited to have you join us. Your email: {{email}}'
};