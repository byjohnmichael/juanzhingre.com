const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 2599 ;

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'];
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SMS Service
class SMSService {
    constructor() {
        this.apiKey = process.env.TEXTBELT_API_KEY || 'textbelt';
        this.baseUrl = 'https://textbelt.com';
    }

    async sendSMS(phone, message) {
        try {
            console.log(`Sending SMS to ${phone}: ${message.substring(0, 50)}...`);
            
            const response = await axios.post(`${this.baseUrl}/text`, {
                phone: phone,
                message: message,
                key: this.apiKey
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
            console.error('SMS Service Error:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    formatPhoneNumber(phone) {
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
}

const smsService = new SMSService();

// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'SMS Server is running' });
});

// Send SMS endpoint
app.post('/api/sms/send', async (req, res) => {
    try {
        const { phone, message } = req.body;
        
        if (!phone || !message) {
            return res.status(400).json({
                success: false,
                error: 'Phone number and message are required'
            });
        }

        const formattedPhone = smsService.formatPhoneNumber(phone);
        const result = await smsService.sendSMS(formattedPhone, message);
        
        res.json(result);
    } catch (error) {
        console.error('SMS endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Send appointment confirmation
app.post('/api/sms/appointment-confirmation', async (req, res) => {
    try {
        const { name, phone, cut, day, time, location, address } = req.body;
        
        if (!name || !phone || !cut || !day || !time || !location) {
            return res.status(400).json({
                success: false,
                error: 'Missing required appointment details'
            });
        }

        const locationText = location.includes('House Call') 
            ? `House Call (+$5) - ${address || 'Address provided'}`
            : 'At Location';
            
        const message = `Hi ${name}! Your appointment is confirmed:\n\n` +
                       `📅 ${day} at ${time}\n` +
                       `✂️ ${cut}\n` +
                       `📍 ${locationText}\n\n` +
                       `I'll reach out soon to confirm details. Thanks for booking!`;

        const formattedPhone = smsService.formatPhoneNumber(phone);
        const result = await smsService.sendSMS(formattedPhone, message);
        
        res.json(result);
    } catch (error) {
        console.error('Appointment confirmation error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Send business notification
app.post('/api/sms/business-notification', async (req, res) => {
    try {
        const { name, phone, cut, day, time, location, address } = req.body;
        
        if (!name || !phone || !cut || !day || !time || !location) {
            return res.status(400).json({
                success: false,
                error: 'Missing required appointment details'
            });
        }

        const businessPhone = process.env.BUSINESS_PHONE;
        if (!businessPhone) {
            return res.status(400).json({
                success: false,
                error: 'Business phone not configured'
            });
        }

        const locationText = location.includes('House Call') 
            ? `House Call (+$5) - ${address || 'Address provided'}`
            : 'At Location';
            
        const message = `🔔 New Appointment Booking:\n\n` +
                       `👤 ${name}\n` +
                       `📞 ${phone}\n` +
                       `📅 ${day} at ${time}\n` +
                       `✂️ ${cut}\n` +
                       `📍 ${locationText}`;

        const result = await smsService.sendSMS(businessPhone, message);
        
        res.json(result);
    } catch (error) {
        console.error('Business notification error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Check quota
app.get('/api/sms/quota', async (req, res) => {
    try {
        const response = await axios.get(`${smsService.baseUrl}/quota/${smsService.apiKey}`);
        res.json(response.data);
    } catch (error) {
        console.error('Quota check error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check quota'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 SMS Server running on port ${PORT}`);
    console.log(`📱 API Key: ${process.env.TEXTBELT_API_KEY ? 'Configured' : 'Using free tier'}`);
    console.log(`📞 Business Phone: ${process.env.BUSINESS_PHONE || 'Not configured'}`);
    console.log(`🌐 Allowed Origins: ${allowedOrigins.join(', ')}`);
});

module.exports = app;
