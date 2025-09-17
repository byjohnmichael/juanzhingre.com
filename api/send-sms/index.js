const axios = require('axios');

// Helper function to format phone number
function formatPhoneNumber(phone) {
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // If it starts with +, keep it as is
    if (cleaned.startsWith('+')) {
        return cleaned;
    }
    
    // If it's 10 digits, assume US number and add +1
    if (cleaned.length === 10) {
        return `+1${cleaned}`;
    }
    
    // If it's 11 digits and starts with 1, add +
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
        return `+${cleaned}`;
    }
    
    // Otherwise, add + if it doesn't have one
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
}

// Helper function to send SMS via Textbelt
async function sendSMS(phone, message) {
    try {
        const response = await axios.post('https://textbelt.com/text', {
            phone: phone,
            message: message,
            key: process.env.TEXTBELT_KEY
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        return {
            success: response.data.success,
            textId: response.data.textId,
            error: response.data.error
        };
    } catch (error) {
        console.error('Textbelt API Error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Main handler
export default async function handler(req, res) {
    // Set CORS headers
    const allowedOrigins = process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN.split(',') : ['*'];
    const origin = req.headers.origin;
    const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
    
    res.setHeader('Access-Control-Allow-Origin', corsOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { phone, message, type, appointment } = req.body;

        // Validate required fields
        if (!phone || !message) {
            return res.status(400).json({
                success: false,
                error: 'Phone number and message are required'
            });
        }

        // Format phone number
        const formattedPhone = formatPhoneNumber(phone);
        
        // Send SMS
        const result = await sendSMS(formattedPhone, message);

        // Log the result
        console.log(`SMS ${result.success ? 'sent' : 'failed'} to ${formattedPhone}:`, result);

        return res.status(200).json(result);

    } catch (error) {
        console.error('SMS API Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}
