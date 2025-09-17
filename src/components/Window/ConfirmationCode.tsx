import React, { useState, useEffect } from 'react';
import edgeConfigService from '../../services/edgeConfigService';
import './ConfirmationCode.css';

interface ConfirmationCodeProps {
    onClose: () => void;
    onConfirm: (code: string) => void;
    appointmentDetails: {
        name: string;
        phone: string;
        cut: string;
        day: string;
        time: string;
        location: string;
        confirmationCode: string;
    };
}

const ConfirmationCode: React.FC<ConfirmationCodeProps> = ({ onClose, onConfirm, appointmentDetails }) => {
    const [code, setCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

    // Countdown timer
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async () => {
        if (code.length !== 4) {
            setError('Please enter a 4-character code');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            // Call the confirm endpoint
            const result = await edgeConfigService.confirmAppointment(code.toUpperCase());
            
            if (result.success) {
                onConfirm(code);
            } else {
                setError(result.error || 'Invalid confirmation code. Please try again.');
            }
        } catch (err) {
            setError('Verification failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div className="confirmation-container">
            <h1 className="confirmation-title">
                Enter Confirmation Code
            </h1>
            
            <div className="confirmation-info">
                <p>We sent a 4-character confirmation code to your phone.</p>
                <p>Please enter it below to complete your appointment booking.</p>
            </div>

            <div className="appointment-summary">
                <h3>Appointment Details:</h3>
                <p><strong>Name:</strong> {appointmentDetails.name}</p>
                <p><strong>Date:</strong> {appointmentDetails.day}</p>
                <p><strong>Time:</strong> {appointmentDetails.time}</p>
                <p><strong>Service:</strong> {appointmentDetails.cut}</p>
                <p><strong>Location:</strong> {appointmentDetails.location}</p>
            </div>

            <div className="code-input-container">
                <label className="code-label">Confirmation Code:</label>
                <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                        if (value.length <= 4) {
                            setCode(value);
                            setError('');
                        }
                    }}
                    onKeyPress={handleKeyPress}
                    disabled={isSubmitting || timeLeft === 0}
                    className={`code-input ${error ? 'error' : ''}`}
                    placeholder="Enter 4-character code"
                    maxLength={4}
                />
                {error && <span className="error-text">{error}</span>}
            </div>

            <div className="timer-container">
                {timeLeft > 0 ? (
                    <p className="timer">Code expires in: {formatTime(timeLeft)}</p>
                ) : (
                    <p className="timer expired">Code has expired</p>
                )}
            </div>

            <div className="button-container">
                <button
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="cancel-button"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || code.length !== 4 || timeLeft === 0}
                    className={`confirm-button ${code.length !== 4 || timeLeft === 0 ? 'disabled' : ''}`}
                >
                    {isSubmitting ? 'Verifying...' : 'Confirm Appointment'}
                </button>
            </div>
        </div>
    );
};

export default ConfirmationCode;
