/**
 * Mail Service using Google Apps Script
 * This replaces Resend for sending confirmation emails via Gmail.
 */

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

/**
 * Sends an email via Google Apps Script Web App
 * @param {Object} options - Email options
 * @param {string|string[]} options.to - Recipient email(s)
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 */
const sendMail = async ({ to, subject, html }) => {
    try {
        if (!GOOGLE_SCRIPT_URL) {
            console.warn('⚠️ WARNING: GOOGLE_SCRIPT_URL is missing. Emails will not be sent.');
            return { success: false, error: 'Scripts URL not configured' };
        }

        // Ensure 'to' is a string (comma separated) or array
        const recipients = Array.isArray(to) ? to.join(',') : to;

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: recipients,
                subject: subject,
                body: html // The Apps Script will receive this as the body
            }),
        });

        const result = await response.json();

        if (result.status === 'success') {
            console.log('📧 Email queued/sent via Google Apps Script');
            return { success: true };
        } else {
            console.error('❌ Google Script Error:', result.message);
            return { success: false, error: result.message };
        }
    } catch (error) {
        console.error('❌ Mail Service Crash:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendMail };
