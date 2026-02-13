const Tesseract = require('tesseract.js');

const performOCR = async (imageBuffer) => {
    try {
        const { data: { text } } = await Tesseract.recognize(
            imageBuffer,
            'eng',
            { logger: m => console.log(m) }
        );

        console.log('OCR Raw Text:', text);

        // Basic extraction logic (Regex) - Optimized for Indian UPI Apps
        const cleanText = text.replace(/\s+/g, ' ');

        // Transaction IDs: 
        // PhonePe: T23... (12+ chars)
        // GPay: 3... (12 digits)
        // Paytm: 2... (12 digits)
        const txIdMatch = cleanText.match(/(?:UPI|TXN|TRX|Ref|UTR|ID|ID[:\s]*|Number[:\s]*|No[:\s]*)[:\s]*([A-Z0-9]{12,})/i) ||
            cleanText.match(/(?:\D|^)(\d{12})(?:\D|$)/); // Look for 12 digit number

        // Amounts often look like "₹ 100.00" or "100.00"
        const amountMatch = cleanText.match(/(?:Amount|Total|Paid|₹|INR|Rs)[:\s]*([0-9,.]+)/i);

        // UPI IDs look like "user@bank"
        const upiMatch = cleanText.match(/[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}/);

        return {
            transactionId: txIdMatch ? (txIdMatch[1] || txIdMatch[0].trim()) : null,
            amount: amountMatch ? amountMatch[1].replace(/,/g, '') : null,
            upiId: upiMatch ? upiMatch[0] : null,
            raw: text
        };
    } catch (error) {
        console.error('OCR Error:', error);
        return null;
    }
};

module.exports = { performOCR };
