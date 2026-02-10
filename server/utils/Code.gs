function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Extracting data matching the Backend's JSON payload
    const {
      emails,
      eventName,
      teamName,
      collegeName,
      verificationCode // <--- MATCHES BACKEND KEY
    } = data;

    // Use the backend's code. Fallback only if missing (should not happen).
    const finalTicketId = verificationCode || Math.floor(100000 + Math.random() * 900000);

    const subject = `Registration Confirmed | ${eventName}`;

    const body = `
Hello,

Your registration for the event "${eventName}" is confirmed.

🎟 Ticket ID: ${finalTicketId}
Team Name: ${teamName}
College: ${collegeName}

Instructions:
• Carry your college ID card
• Keep this Ticket ID for verification

Best regards,
Automobile Engineering Association (AEA)
Kongu Engineering College
`;

    // Send emails
    if (emails && emails.length > 0) {
       emails.forEach(email => {
         MailApp.sendEmail(email, subject, body);
       });
    }

    // Return success JSON
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success', // Matches backend check: if (result.status === 'success')
        ticketId: finalTicketId
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
