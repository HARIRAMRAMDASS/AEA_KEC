/**
 * Mail Service using Google Apps Script
 * This utility sends participant data to a Google Apps Script Web App for Gmail-based delivery.
 * 
 * PHASE 1 - TASK A: VERIFY & FIX BACKEND -> APPS SCRIPT CALL
 * - Uses process.env.APPSCRIPT_URL inside the function to ensure environment is fully loaded.
 * - Adds detailed logging for debugging.
 */

/**
 * Sends participant data via Google Apps Script Web App
 * @param {Object} data - Email payload
 * @param {string[]} data.emails - Array of participant emails
 * @param {string} data.eventName - Name of the registered event(s)
 * @param {string} data.teamName - Name of the team
 * @param {string} data.collegeName - Name of the college
 */
const sendMail = async ({ emails, eventName, teamName, collegeName, verificationCode }) => {
    // 1. READ URL AT RUNTIME
    let scriptUrl = process.env.APPSCRIPT_URL;

    // 2. VALIDATION
    if (!scriptUrl || scriptUrl.includes('YOUR_GOOGLE_SCRIPT') || scriptUrl.length < 10) {
        console.warn('⚠️ EMAIL WARNING: APPSCRIPT_URL is missing or invalid in environment variables.');
        console.warn('   Participants will NOT receive confirmation emails.');
        console.warn('   Current Value:', scriptUrl || 'undefined');
        return { success: false, error: 'Apps Script URL not configured or invalid' };
    }

    // 3. LOG REQUEST
    console.log('📨 [MailService] Preparing to send email...');
    console.log(`   To: ${emails.length} recipients (${emails.join(', ')})`);
    console.log(`   Event: ${eventName}`);

    try {
        const response = await fetch(scriptUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                emails,
                eventName,
                teamName,
                collegeName,
                verificationCode
            }),
        });

        // 4. CHECK HTTP STATUS
        if (!response.ok) {
            const text = await response.text();
            console.error(`❌ [MailService] HTTP Error: ${response.status} ${response.statusText}`);
            console.error(`   Response Body: ${text}`);
            return { success: false, error: `HTTP Error: ${response.status}` };
        }

        const result = await response.json();

        // 5. CHECK SCRIPT RESULT
        if (result.status === 'success') {
            console.log(`✅ [MailService] Email sent successfully via Google Apps Script`);
            return { success: true };
        } else {
            console.error('❌ [MailService] Google Script Logic Error:', result.message || 'Unknown error');
            return { success: false, error: result.message };
        }
    } catch (error) {
        // 6. FAIL SAFE (Don't crash server)
        console.error('❌ [MailService] Network/Fetch Error:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendMail };
