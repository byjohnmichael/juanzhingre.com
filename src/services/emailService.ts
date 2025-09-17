interface AppointmentDetails {
    name: string;
    phone: string;
    cut: string;
    day: string;
    time: string;
    location: string;
    address?: string;
}

interface EmailResponse {
    success: boolean;
    messageId?: string;
    error?: string;
}

interface SMSFailureNotificationResult {
    devEmailSent: boolean;
    clientEmailSent: boolean;
    devError?: string;
    clientError?: string;
}

class EmailService {
    private devEmail: string;
    private clientEmail: string;

    constructor() {
        // These would typically come from environment variables
        this.devEmail = 'byjohnmichael@gmail.com';
        this.clientEmail = 'johnmburnside21@gmail.com';
    }

    /**
     * Send email using EmailJS (client-side email service)
     */
    private async sendEmail(to: string, subject: string, message: string): Promise<EmailResponse> {
        try {
            // Using EmailJS for client-side email sending
            // You'll need to install: npm install @emailjs/browser
            const emailjs = await import('@emailjs/browser');
            
            const templateParams = {
                to_email: to,
                subject: subject,
                message: message,
                from_name: 'Juan Zhingre Website'
            };

            const result = await emailjs.send(
                process.env.REACT_APP_EMAILJS_SERVICE_ID || 'your_service_id',
                process.env.REACT_APP_EMAILJS_TEMPLATE_ID || 'your_template_id',
                templateParams,
                process.env.REACT_APP_EMAILJS_PUBLIC_KEY || 'your_public_key'
            );

            console.log('Email sent successfully:', result.text);
            return {
                success: true,
                messageId: result.text
            };
        } catch (error) {
            console.error('Email sending failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Send SMS failure notification to both developer and client
     */
    async sendSMSFailureNotification(appointmentDetails: AppointmentDetails, smsError: string): Promise<SMSFailureNotificationResult> {
        const subject = '🚨 SMS Failure - Appointment Booking Issue';
        const errorDetails = `
SMS Sending Failed for Appointment Booking

Appointment Details:
- Name: ${appointmentDetails.name}
- Phone: ${appointmentDetails.phone}
- Cut: ${appointmentDetails.cut}
- Day: ${appointmentDetails.day}
- Time: ${appointmentDetails.time}
- Location: ${appointmentDetails.location}
${appointmentDetails.address ? `- Address: ${appointmentDetails.address}` : ''}

SMS Error Details:
${smsError}

Timestamp: ${new Date().toISOString()}
        `.trim();

        // Send to developer
        const devResult = await this.sendEmail(this.devEmail, subject, errorDetails);

        // Send notification to client
        const clientSubject = '📱 SMS Notification Failed - Manual Follow-up Required';
        const clientMessage = `
Hello,

A customer just booked an appointment but the SMS confirmation failed to send.

Customer Details:
- Name: ${appointmentDetails.name}
- Phone: ${appointmentDetails.phone}
- Appointment: ${appointmentDetails.day} at ${appointmentDetails.time}
- Service: ${appointmentDetails.cut}
- Location: ${appointmentDetails.location}

Please contact the customer directly to confirm their appointment.

Best regards,
Automated System
        `.trim();

        const clientResult = await this.sendEmail(this.clientEmail, clientSubject, clientMessage);

        return {
            devEmailSent: devResult.success,
            clientEmailSent: clientResult.success,
            devError: devResult.error,
            clientError: clientResult.error
        };
    }

    /**
     * Send appointment reminder to client
     */
    async sendAppointmentReminder(appointmentDetails: AppointmentDetails): Promise<EmailResponse> {
        const subject = '📅 New Appointment Booking Reminder';
        const message = `
New Appointment Booked!

Customer Details:
- Name: ${appointmentDetails.name}
- Phone: ${appointmentDetails.phone}
- Service: ${appointmentDetails.cut}
- Day: ${appointmentDetails.day}
- Time: ${appointmentDetails.time}
- Location: ${appointmentDetails.location}
${appointmentDetails.address ? `- Address: ${appointmentDetails.address}` : ''}

The customer has been sent an SMS confirmation.

Timestamp: ${new Date().toISOString()}
        `.trim();

        return await this.sendEmail(this.clientEmail, subject, message);
    }

    /**
     * Send general email notification
     */
    async sendGeneralNotification(to: string, subject: string, message: string): Promise<EmailResponse> {
        return await this.sendEmail(to, subject, message);
    }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;

