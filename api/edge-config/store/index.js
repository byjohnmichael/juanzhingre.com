const { EdgeConfig } = require('@vercel/edge-config');

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
        const { confirmationCode, appointmentDetails, status, createdAt, expiresAt } = req.body;

        // Validate required fields
        if (!confirmationCode || !appointmentDetails || !status || !createdAt || !expiresAt) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Store in Edge Config
        const edgeConfig = EdgeConfig.fromEnv();
        
        // Create a unique key for this confirmation
        const key = `confirmation_${confirmationCode}`;
        
        const confirmationData = {
            confirmationCode,
            appointmentDetails,
            status,
            createdAt,
            expiresAt
        };

        await edgeConfig.put(key, confirmationData);

        console.log(`Stored confirmation data for code: ${confirmationCode}`);

        return res.status(200).json({
            success: true,
            message: 'Confirmation data stored successfully'
        });

    } catch (error) {
        console.error('Edge Config store error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to store confirmation data'
        });
    }
};
