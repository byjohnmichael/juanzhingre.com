const axios = require('axios');

// HELPER function to format phone number
function formatPhoneNumber(phone) {
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    if (cleaned.startsWith('+')) {
        return cleaned;
    }
    
    if (cleaned.length === 10) {
        return `+1${cleaned}`;
    }
    
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
        return `+${cleaned}`;
    }
    
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
}

// HELPER function to send SMS via Textbelt
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

// MAIN handler
module.exports = async (req, res) => {
    // Set CORS headers
    const allowedOrigins = ['https://juanzhingre.com', 'https://www.juanzhingre.com', 'http://localhost:2509'];
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
        const { name, phone, cut, day, time, location, address } = req.body;
        
        // Validate required fields
        if (!name || !phone || !cut || !day || !time || !location) {
            return res.status(400).json({
                success: false,
                error: 'Missing required appointment details'
            });
        }

        // Format the confirmation message
        const locationText = location.includes('House Call') 
            ? `House Call (+$5) - ${address || 'Address provided'}`
            : 'At Location';
            
        const message = `Hey ${name}! Your appointment is confirmed:\n\n` +
                       `📅 ${day} at ${time}\n` +
                       `✂️ ${cut}\n` +
                       `📍 ${locationText}\n\n` +
                       `I'll reach out soon to confirm details. Thanks for booking!`;

        // Format phone number and send SMS
        const formattedPhone = formatPhoneNumber(phone);
        const result = await sendSMS(formattedPhone, message);

        // Log the result
        console.log(`Appointment confirmation ${result.success ? 'sent' : 'failed'} to ${formattedPhone}:`, result);

        return res.status(200).json(result);

    } catch (error) {
        console.error('Appointment confirmation API Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}