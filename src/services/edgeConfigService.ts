interface ConfirmationData {
    confirmationCode: string;
    appointmentDetails: {
        name: string;
        phone: string;
        cut: string;
        day: string;
        date: string;
        time: string;
        location: string;
        address?: string;
    };
    status: 'pending' | 'confirmed';
    createdAt: string;
    expiresAt: string;
}

interface AppointmentSlot {
    day: string;
    date: string;
    time: string;
    status: 'available' | 'confirmed' | 'pending';
}

class EdgeConfigService {
    private baseUrl: string;

    constructor() {
        // Use Vercel Edge Config API
        this.baseUrl = process.env.NODE_ENV === 'development' 
            ? 'http://localhost:3001/api/edge-config' // Local development
            : 'https://www.juanzhingre.com/api/edge-config'; // Production
    }

    /**
     * Store confirmation data in Edge Config
     */
    async storeConfirmation(data: ConfirmationData): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/store`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Edge Config store error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Verify confirmation code
     */
    async verifyConfirmation(code: string): Promise<{ success: boolean; data?: ConfirmationData; error?: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/verify/${code}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Edge Config verify error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Update confirmation status to confirmed
     */
    async confirmAppointment(code: string): Promise<{ success: boolean; data?: ConfirmationData; error?: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/confirm/${code}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Edge Config confirm error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Get appointment availability for a date range
     */
    async getAppointmentAvailability(startDate: string, endDate: string): Promise<{ success: boolean; slots?: AppointmentSlot[]; error?: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/availability?start=${startDate}&end=${endDate}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Edge Config availability error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Clean up expired confirmations
     */
    async cleanupExpired(): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/cleanup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Edge Config cleanup error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
}

// Export singleton instance
export const edgeConfigService = new EdgeConfigService();
export default edgeConfigService;
