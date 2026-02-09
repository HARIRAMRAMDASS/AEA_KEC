const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

// Test URL
const BASE_URL = 'https://aea-kec-website.onrender.com/api';

async function testEventCreation() {
    try {
        console.log('1. Logging in...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'ramdasshariram@gmail.com',
            password: 'hari567@4'
        });

        console.log('Login Status:', loginRes.status);
        const cookies = loginRes.headers['set-cookie'];
        if (!cookies) {
            console.error('No cookies received!');
            return;
        }
        console.log('Cookies received:', cookies);

        console.log('2. Creating Event...');
        const form = new FormData();
        form.append('name', 'Test Event via Script');
        form.append('type', 'Tech');
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        form.append('date', futureDate.toISOString());
        form.append('teamSize', '1');
        form.append('feeType', 'Per Head');
        form.append('feeAmount', '100');
        form.append('closingDate', futureDate.toISOString());
        form.append('whatsappLink', 'https://chat.whatsapp.com/test');
        form.append('maxSelectableEvents', '1');
        form.append('selectionMode', 'Both');
        form.append('eventGroup', 'Auto Expo'); // Ensure valid enum value

        // Use a dummy file for upload
        const dummyPath = path.join(__dirname, 'dummy.txt');
        fs.writeFileSync(dummyPath, 'This is a dummy image content for testing upload');
        form.append('qrCode', fs.createReadStream(dummyPath), 'dummy.txt');

        const createRes = await axios.post(`${BASE_URL}/events`, form, {
            headers: {
                ...form.getHeaders(),
                Cookie: cookies.join('; ') // Send cookies back
            }
        });

        console.log('Event Creation Status:', createRes.status);
        console.log('Event Created:', createRes.data);

        // Cleanup
        fs.unlinkSync(dummyPath);

    } catch (error) {
        console.error('Test Failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testEventCreation();
