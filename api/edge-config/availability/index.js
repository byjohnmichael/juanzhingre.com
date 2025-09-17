const { EdgeConfig } = require('@vercel/edge-config');

module.exports = async (req, res) => {
    // Set CORS headers
    const allowedOrigins = ['https://juanzhingre.com', 'https://www.juanzhingre.com', 'http://localhost:2509'];
    const origin = req.headers.origin;
    const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
    
    res.setHeader('Access-Control-Allow-Origin', corsOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { start, end } = req.query;

        if (!start || !end) {
            return res.status(400).json({
                success: false,
                error: 'Start and end dates are required'
            });
        }

        // Get all confirmation data from Edge Config
        const edgeConfig = EdgeConfig.fromEnv();
        const allData = await edgeConfig.getAll();

        // Filter for appointment data and check status
        const appointments = [];
        const now = new Date();

        for (const [key, value] of Object.entries(allData)) {
            if (key.startsWith('confirmation_') && value && value.appointmentDetails) {
                const appointment = value;
                const appointmentDate = new Date(appointment.appointmentDetails.date);
                const startDate = new Date(start);
                const endDate = new Date(end);

                // Check if appointment is within date range
                if (appointmentDate >= startDate && appointmentDate <= endDate) {
                    // Check if not expired
                    const expiresAt = new Date(appointment.expiresAt);
                    if (now <= expiresAt) {
                        appointments.push({
                            day: appointment.appointmentDetails.day,
                            date: appointment.appointmentDetails.date,
                            time: appointment.appointmentDetails.time,
                            status: appointment.status
                        });
                    }
                }
            }
        }

        console.log(`Retrieved ${appointments.length} appointments for date range ${start} to ${end}`);

        return res.status(200).json({
            success: true,
            slots: appointments
        });

    } catch (error) {
        console.error('Edge Config availability error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get appointment availability'
        });
    }
};
