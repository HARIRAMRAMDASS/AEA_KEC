
/**
 * Detects if the current device is mobile or tablet.
 * @returns {boolean}
 */
export const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Generates a valid UPI deep link and handles redirection.
 * @param {Object} options - Payment options
 * @param {string} options.upiId - Merchant UPI ID
 * @param {string} options.name - Merchant / Event Name
 * @param {string|number} options.amount - Payment Amount
 * @returns {string|null} - The generated link or null if invalid
 */
export const generateUPILink = ({ upiId, name, amount }) => {
    // 1. Validation: UPI ID must contain @ and no spaces
    if (!upiId || !upiId.includes('@') || /\s/.test(upiId)) {
        console.error("Invalid UPI ID:", upiId);
        return null;
    }

    // 2. Validation: Amount must be numeric and > 0
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
        console.error("Invalid Amount:", amount);
        return null;
    }

    // 3. Clean UPI ID (remove any accidentally remaining spaces)
    const cleanUpiId = upiId.trim().replace(/\s/g, '');

    // 4. Encode Name (pa handles encoding in sub-parts, but pn needs encoding)
    const encodedName = encodeURIComponent(name.trim());

    // 5. Build Intent Link
    // upi://pay?pa=UPI_ID&pn=NAME&am=AMOUNT&cu=INR
    const upiLink = `upi://pay?pa=${cleanUpiId}&pn=${encodedName}&am=${numericAmount}&cu=INR`;

    return upiLink;
};

/**
 * Triggers the UPI payment intent or handles desktop fallback.
 * @param {Object} options - Payment options
 * @param {Function} onDesktop - Callback for desktop detection
 * @returns {void}
 */
export const triggerUPIPayment = ({ upiId, name, amount, onDesktop }) => {
    if (!isMobileDevice()) {
        if (onDesktop) onDesktop();
        return;
    }

    const upiLink = generateUPILink({ upiId, name, amount });

    if (upiLink) {
        // Create an invisible anchor element to trigger the deep link
        const link = document.createElement("a");
        link.href = upiLink;
        link.style.display = "none";
        document.body.appendChild(link);

        // Trigger the click
        link.click();

        // Cleanup with a small delay
        setTimeout(() => {
            if (document.body.contains(link)) {
                document.body.removeChild(link);
            }
        }, 300);
    }
};
