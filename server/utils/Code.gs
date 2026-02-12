/**
 * AEA_KEC Email Service
 * Receives data from Node.js and sends professional confirmation emails.
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // 1. Extract Ticket ID (Priority to the ticketId field)
    const ticketId = data.ticketId || data.verificationCode || "N/A";
    const eventName = data.eventName || "Event Registration";
    const teamName = data.teamName || "Individual";
    const collegeName = data.collegeName || "N/A";
    const emails = data.emails;

    // 2. Draft Professional HTML Content
    const subject = "Registration Confirmed - " + eventName;
    
    const htmlBody = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 15px; overflow: hidden; color: #333; line-height: 1.6;">
        <!-- Header -->
        <div style="background-color: #000; color: #00A19B; padding: 30px; text-align: center;">
          <h1 style="margin: 0; text-transform: uppercase; letter-spacing: 2px; font-size: 24px;">Registration Confirmed</h1>
          <p style="margin: 5px 0 0; color: #fff; opacity: 0.8; font-size: 0.9rem;">AEA_KEC Automobile Engineering Association</p>
        </div>
        
        <!-- Body -->
        <div style="padding: 40px; background-color: #ffffff;">
          <p>Dear Participant,</p>
          <p>Your registration for <strong>${eventName}</strong> has been successfully confirmed!</p>
          
          <div style="margin: 40px 0; text-align: center; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0; padding: 30px 0;">
            <p style="margin: 0; text-transform: uppercase; letter-spacing: 1px; font-size: 0.8rem; color: #666;">Digital Entry Pass</p>
            <div style="margin: 15px 0; font-size: 32px; font-weight: 800; color: #000; letter-spacing: 4px;">
              ${ticketId}
            </div>
          </div>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
            <p style="margin: 0 0 5px;"><strong>Event:</strong> ${eventName}</p>
            <p style="margin: 0 0 5px;"><strong>Team Name:</strong> ${teamName}</p>
            <p style="margin: 0;"><strong>College:</strong> ${collegeName}</p>
          </div>

          <div style="border-left: 4px solid #00A19B; padding-left: 20px; margin: 30px 0;">
            <p style="margin: 0 0 10px; font-weight: 600;">Important Instructions:</p>
            <ul style="padding-left: 20px; margin: 0; font-size: 0.95rem;">
              <li style="margin-bottom: 10px;"><b>E-certificate will be provided to all participants.</b></li>
              <li style="margin-bottom: 10px;"><b>The tag with the ticket ID will be checked every time you enter the gate. Keep it safe and do not exchange it with your friends.</b></li>
              <li style="margin-bottom: 10px;">Carry your college ID card for verification.</li>
            </ul>
          </div>
          
          <p style="margin-top: 40px; font-size: 0.9rem; color: #666; text-align: center;">
            Safe driving,<br>
            <strong>Team AEA_KEC</strong><br>
            Kongu Engineering College
          </p>
        </div>
      </div>
    `;

    // 3. Send Email to all members
    if (emails && emails.length > 0) {
      GmailApp.sendEmail(emails.join(','), subject, "", {
        htmlBody: htmlBody
      });
    }

    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'success', 
      message: 'Email sent with Ticket ID: ' + ticketId 
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'error', 
      message: err.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
