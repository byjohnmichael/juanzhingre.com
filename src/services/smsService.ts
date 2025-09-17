interface SMSConfig {
    apiKey: string;
    baseUrl: string;
}

interface AppointmentDetails {
    name: string;
    phone: string;
    cut: string;
    day: string;
    time: string;
    location: string;
    address?: string;
}

interface SMSResponse {
    success: boolean;
    textId?: string;
    error?: string;
}

class SMSService {
    private config: SMSConfig;

    constructor() {
        this.config = {
            apiKey: process.env.REACT_APP_TEXTBELT_API_KEY || 'textbelt', // Fallback to free tier
            baseUrl: process.env.REACT_APP_SMS_SERVER_URL || 'https://juanzhingre.com'
        };
    }

    /**
     * Send SMS notification for appointment booking
     */
    async sendAppointmentConfirmation(appointment: AppointmentDetails): Promise<SMSResponse> {
        return this.sendAppointmentSMS(appointment, 'confirmation');
    }

    /**
     * Send SMS to business owner about new appointment
     */
    async sendBusinessNotification(appointment: AppointmentDetails, businessPhone: string): Promise<SMSResponse> {
        return this.sendAppointmentSMS(appointment, 'business');
    }

    /**
     * Send reminder SMS (can be used for appointment reminders)
     */
    async sendReminder(phone: string, message: string): Promise<SMSResponse> {
        return this.sendSMS(phone, message);
    }

    /**
     * Send appointment SMS via backend API
     */
    private async sendAppointmentSMS(appointment: AppointmentDetails, type: 'confirmation' | 'business'): Promise<SMSResponse> {
        try {
            const endpoint = type === 'confirmation' 
                ? '/api/appointment-confirmation'
                : '/api/business-notification';
            
            console.log(`SMS Debug - Sending ${type} SMS via Vercel API`);
            console.log('SMS Debug - API URL:', `${this.config.baseUrl}${endpoint}`);
            
            const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(appointment)
            });

            console.log('SMS Debug - Response status:', response.status);
            console.log('SMS Debug - Response ok:', response.ok);

            const data = await response.json();
            console.log('SMS Debug - Response data:', data);
            
            return data;
        } catch (error) {
            console.error('SMS Service Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Core SMS sending method (for general SMS)
     */
    private async sendSMS(phone: string, message: string): Promise<SMSResponse> {
        try {
            console.log('SMS Debug - Sending general SMS via Vercel API');
            console.log('SMS Debug - API URL:', `${this.config.baseUrl}/api/send-sms`);
            
            const response = await fetch(`${this.config.baseUrl}/api/send-sms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone: phone,
                    message: message
                })
            });

            console.log('SMS Debug - Response status:', response.status);
            console.log('SMS Debug - Response ok:', response.ok);

            const data = await response.json();
            console.log('SMS Debug - Response data:', data);
            
            return data;
        } catch (error) {
            console.error('SMS Service Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Format phone number for Textbelt API
     */
    private formatPhoneNumber(phone: string): string {
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

    /**
     * Format appointment confirmation message for customer
     */
    private formatAppointmentMessage(appointment: AppointmentDetails): string {
        const locationText = appointment.location.includes('House Call') 
            ? `House Call (+$5) - ${appointment.address || 'Address provided'}`
            : 'At Location';
            
        return `Hi ${appointment.name}! Your appointment is confirmed:\n\n` +
               `📅 ${appointment.day} at ${appointment.time}\n` +
               `✂️ ${appointment.cut}\n` +
               `📍 ${locationText}\n\n` +
               `I'll reach out soon to confirm details. Thanks for booking!`;
    }

    /**
     * Format business notification message
     */
    private formatBusinessNotification(appointment: AppointmentDetails): string {
        const locationText = appointment.location.includes('House Call') 
            ? `House Call (+$5) - ${appointment.address || 'Address provided'}`
            : 'At Location';
            
        return `🔔 New Appointment Booking:\n\n` +
               `👤 ${appointment.name}\n` +
               `📞 ${appointment.phone}\n` +
               `📅 ${appointment.day} at ${appointment.time}\n` +
               `✂️ ${appointment.cut}\n` +
               `📍 ${locationText}`;
    }

    /**
     * Check SMS quota via backend
     */
    async checkQuota(): Promise<{ success: boolean; quota?: number; error?: string }> {
        try {
            const response = await fetch(`${this.config.baseUrl}/api/sms/quota`);
            const data = await response.json();
            
            if (data.success) {
                return {
                    success: true,
                    quota: data.quota
                };
            } else {
                return {
                    success: false,
                    error: data.error || 'Failed to check quota'
                };
            }
        } catch (error) {
            console.error('Quota check error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Check delivery status of a sent SMS (not implemented in backend yet)
     */
    async checkDeliveryStatus(textId: string): Promise<{ success: boolean; status?: string; error?: string }> {
        // This would need to be implemented in the backend
        return {
            success: false,
            error: 'Delivery status checking not implemented in backend'
        };
    }
}

// Export singleton instance
export const smsService = new SMSService();
export default smsService;
