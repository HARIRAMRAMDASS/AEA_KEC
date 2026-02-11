const Tesseract = require('tesseract.js');

const performOCR = async (imageBuffer) => {
    try {
        const { data: { text } } = await Tesseract.recognize(
            imageBuffer,
            'eng',
            { logger: m => console.log(m) }
        );

        console.log('OCR Raw Text:', text);

        // Basic extraction logic (Regex)
        // Transaction IDs often look like "T230211..." or numeric strings
        const txIdMatch = text.match(/(?:UPI|TXN|Transaction|Ref|ID)[:\s]*([A-Z0-9]{10,})/i);
        // Amounts often look like "₹ 100.00" or "100.00"
        const amountMatch = text.match(/(?:Amount|Total|Paid|₹|INR)[:\s]*([0-9,.]+)/i);
        // UPI IDs look like "user@bank"
        const upiMatch = text.match(/[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}/);

        return {
            transactionId: txIdMatch ? txIdMatch[1] : null,
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
