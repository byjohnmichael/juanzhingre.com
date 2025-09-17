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
        const { code } = req.query;

        if (!code) {
            return res.status(400).json({
                success: false,
                error: 'Confirmation code is required'
            });
        }

        // Get from Edge Config
        const edgeConfig = EdgeConfig.fromEnv();
        const key = `confirmation_${code}`;
        const confirmationData = await edgeConfig.get(key);

        if (!confirmationData) {
            return res.status(404).json({
                success: false,
                error: 'Confirmation code not found or expired'
            });
        }

        // Check if expired
        const now = new Date();
        const expiresAt = new Date(confirmationData.expiresAt);

        if (now > expiresAt) {
            // Clean up expired data
            await edgeConfig.delete(key);
            
            return res.status(410).json({
                success: false,
                error: 'Confirmation code has expired'
            });
        }

        // Update status to confirmed
        const updatedData = {
            ...confirmationData,
            status: 'confirmed'
        };

        await edgeConfig.put(key, updatedData);

        console.log(`Confirmed appointment with code: ${code}`);

        return res.status(200).json({
            success: true,
            data: updatedData
        });

    } catch (error) {
        console.error('Edge Config confirm error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to confirm appointment'
        });
    }
};
