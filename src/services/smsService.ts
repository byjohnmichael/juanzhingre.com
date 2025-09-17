import { emailService } from './emailService';

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
    confirmationCode?: string;
}

interface SMSResponse {
    success: boolean;
    textId?: string;
    error?: string;
    emailFallbackUsed?: boolean;
}

class SMSService {
    private config: SMSConfig;
    private clientEmail: string;

    constructor() {
        // Auto-detect environment and use appropriate URL
        const isDevelopment = process.env.NODE_ENV === 'development';
        const baseUrl = isDevelopment 
            ? 'http://localhost:2599'
            : 'https://www.juanzhingre.com';
            
        this.config = {
            apiKey: process.env.REACT_APP_TEXTBELT_API_KEY || 'textbelt', // Fallback to free tier
            baseUrl: baseUrl
        };
        
        this.clientEmail = 'johnmburnside21@gmail.com';
    }

    /**
     * Generate a 4-character confirmation code
     */
    private generateConfirmationCode(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Send SMS notification for appointment booking
     */
    async sendAppointmentConfirmation(appointment: AppointmentDetails): Promise<SMSResponse & { confirmationCode?: string }> {
        // Generate confirmation code
        const confirmationCode = this.generateConfirmationCode();
        const appointmentWithCode = { ...appointment, confirmationCode };
        
        const result = await this.sendAppointmentSMS(appointmentWithCode, 'confirmation');
        return { ...result, confirmationCode };
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
     * Send appointment SMS via backend API with email fallback
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

            if (!response.ok) {
                throw new Error(`API request failed with status: ${response.status}`);
            }

            const data = await response.json();
            console.log('SMS Debug - Response data:', data);
            
            // If SMS failed, try email fallback
            if (!data.success) {
                console.log('SMS failed, attempting email fallback...');
                await this.handleEmailFallback(appointment, data.error || 'SMS sending failed', type);
                return {
                    ...data,
                    emailFallbackUsed: true
                };
            }
            
            return data;
        } catch (error) {
            console.error('SMS Service Error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            
            // API is down or failed, try email fallback
            console.log('API failed, attempting email fallback...');
            await this.handleEmailFallback(appointment, errorMessage, type);
            
            return {
                success: false,
                error: errorMessage,
                emailFallbackUsed: true
            };
        }
    }

    /**
     * Handle email fallback when SMS fails
     */
    private async handleEmailFallback(appointment: AppointmentDetails, error: string, type: 'confirmation' | 'business'): Promise<void> {
        try {
            if (type === 'confirmation') {
                // For customer confirmations, send failure notification
                await emailService.sendSMSFailureNotification(appointment, error);
            } else {
                // For business notifications, send failure notification
                await emailService.sendSMSFailureNotification(appointment, error);
            }
            console.log('Email fallback notification sent successfully');
        } catch (emailError) {
            console.error('Email fallback also failed:', emailError);
            // At this point, we've tried both SMS and email - user should be notified
        }
    }

    /**
     * Core SMS sending method (for general SMS) with email fallback
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

            if (!response.ok) {
                throw new Error(`API request failed with status: ${response.status}`);
            }

            const data = await response.json();
            console.log('SMS Debug - Response data:', data);
            
            // If SMS failed, try email fallback
            if (!data.success) {
                console.log('SMS failed, attempting email fallback...');
                await this.handleGeneralEmailFallback(phone, message, data.error || 'SMS sending failed');
                return {
                    ...data,
                    emailFallbackUsed: true
                };
            }
            
            return data;
        } catch (error) {
            console.error('SMS Service Error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            
            // API is down or failed, try email fallback
            console.log('API failed, attempting email fallback...');
            await this.handleGeneralEmailFallback(phone, message, errorMessage);
            
            return {
                success: false,
                error: errorMessage,
                emailFallbackUsed: true
            };
        }
    }

    /**
     * Handle email fallback for general SMS
     */
    private async handleGeneralEmailFallback(phone: string, message: string, error: string): Promise<void> {
        try {
            const subject = '📱 SMS Failed - Manual Follow-up Required';
            const emailMessage = `
SMS sending failed for the following message:

Phone: ${phone}
Message: ${message}

Error: ${error}

Please contact the recipient directly.

Timestamp: ${new Date().toISOString()}
            `.trim();

            await emailService.sendGeneralNotification(this.clientEmail, subject, emailMessage);
            console.log('General email fallback notification sent successfully');
        } catch (emailError) {
            console.error('General email fallback also failed:', emailError);
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
               `Confirmation Code: ${appointment.confirmationCode}\n\n` +
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
