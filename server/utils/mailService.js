/**
 * Mail Service using Google Apps Script
 * This utility sends participant data to a Google Apps Script Web App for Gmail-based delivery.
 */

// Step 3: Read Apps Script URL from process.env.APPSCRIPT_URL
const APPSCRIPT_URL = process.env.APPSCRIPT_URL;

/**
 * Sends participant data via Google Apps Script Web App
 * @param {Object} data - Email payload
 * @param {string[]} data.emails - Array of participant emails
 * @param {string} data.eventName - Name of the registered event(s)
 * @param {string} data.teamName - Name of the team
 * @param {string} data.collegeName - Name of the college
 */
const sendMail = async ({ emails, eventName, teamName, collegeName }) => {
    try {
        if (!APPSCRIPT_URL) {
            console.warn('⚠️ WARNING: APPSCRIPT_URL is missing in environment variables. Email notification was skipped.');
            return { success: false, error: 'Apps Script URL not configured' };
        }

        const response = await fetch(APPSCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                emails,
                eventName,
                teamName,
                collegeName
            }),
        });

        const result = await response.json();

        // Standard Google Apps Script JSON return is usually { "status": "success/error" }
        if (result.status === 'success') {
            console.log(`📧 Confirmation emails queued for: ${emails.join(', ')}`);
            return { success: true };
        } else {
            console.error('❌ Google Script Web App Error:', result.message || 'Unknown error');
            return { success: false, error: result.message };
        }
    } catch (error) {
        // Step 5: Email sending failure must NOT break registration, purely logged.
        console.error('❌ Mail Service Network Error:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = { sendMail };
