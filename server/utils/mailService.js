const { Resend } = require('resend');

// Initialize Resend lazily to prevent crash if key is missing
let resend = null;
if (process.env.RESEND_API_KEY) {
    console.log('✅ Resend API Key detected');
    resend = new Resend(process.env.RESEND_API_KEY);
} else {
    console.warn('⚠️ WARNING: RESEND_API_KEY is missing. Emails will not be sent.');
}

/**
 * Sends a production-ready email via Resend
 * @param {Object} options - Email options
 * @param {string|string[]} options.to - Recipient email(s)
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 */
const sendMail = async ({ to, subject, html }) => {
    try {
        if (!resend) {
            console.error('❌ Mail Service Error: Cannot send email because RESEND_API_KEY is missing.');
            return { success: false, error: 'API key not configured' };
        }

        // Ensure 'to' is an array if multiple emails are provided
        const recipients = Array.isArray(to) ? to : [to];

        const { data, error } = await resend.emails.send({
            // ROOT CAUSE FIX: Using 'onboarding@resend.dev' works only for authorized test emails.
            // For production with verified domains, replace this with your domain.
            from: "AEA <onboarding@resend.dev>",
            to: recipients,
            subject,
            html,
        });

        if (error) {
            console.error('❌ Resend API Error:', error);
            return { success: false, error };
        }

        console.log('📧 Email sent successfully:', data.id);
        return { success: true, data };
    } catch (error) {
        console.error('❌ Mail Service Crash:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendMail };
