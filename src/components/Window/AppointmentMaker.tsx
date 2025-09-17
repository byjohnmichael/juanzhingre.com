import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import smsService from '../../services/smsService';
import './AppointmentMaker.css';

interface AppointmentMakerProps {
    onClose: () => void;
}

const AppointmentMaker: React.FC<AppointmentMakerProps> = ({ onClose }) => {
    // Cut selection
    const [cutSelected, setCutSelected] = useState(false);
    
    // Availability
    const [selectedDay, setSelectedDay] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    
    // Location
    const [isHouseCall, setIsHouseCall] = useState(false);
    
    // Contact info
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [smsEnabled, setSmsEnabled] = useState(true);
    const [businessPhone] = useState(process.env.BUSINESS_PHONE || '');

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const getTimeSlots = (day: string) => {
        if (day === 'Saturday') {
            return ['12:00PM', '2:00PM', '4:00PM', '6:00PM'];
        } else {
            return ['4:00PM', '6:00PM'];
        }
    };

    const validatePhone = (phone: string) => {
        const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
    };

    const isFormComplete = () => {
        const hasCut = cutSelected;
        const hasAvailability = selectedDay && selectedTime;
        const hasLocation = isHouseCall !== null;
        const hasContact = name && phone && validatePhone(phone);
        const hasAddress = !isHouseCall || address;
        
        return hasCut && hasAvailability && hasLocation && hasContact && hasAddress;
    };

    const handleSchedule = async () => {
        if (isFormComplete()) {
            setIsSubmitting(true);
            
            try {
                const appointmentDetails = {
                    name: name,
                    phone: phone,
                    cut: 'Volume 1 Cut',
                    day: selectedDay,
                    time: selectedTime,
                    location: isHouseCall ? `House Call (+$5) - ${address}` : 'At Location',
                    address: isHouseCall ? address : undefined
                };

                const templateParams = {
                    name: name,
                    phone: phone,
                    cut: 'Volume 1 Cut',
                    day: selectedDay,
                    time: selectedTime,
                    location: isHouseCall ? `House Call (+$5) - ${address}` : 'At Location',
                    message: `New appointment request:\n\nCut: Volume 1 Cut ($20)\nDay: ${selectedDay}\nTime: ${selectedTime}\nLocation: ${isHouseCall ? `House Call (+$5) - ${address}` : 'At Location'}\n\nContact Info:\nName: ${name}\nPhone: ${phone}`
                };

                // Send email notification
                await emailjs.send(
                    'service_li6pxqa',
                    'template_i1lmcnm',
                    templateParams,
                    'gyiS7YPcgxpQGxBch'
                );

                // Send SMS notifications if enabled
                if (smsEnabled) {
                    try {
                        // Send confirmation SMS to customer
                        const customerSmsResult = await smsService.sendAppointmentConfirmation(appointmentDetails);
                        if (!customerSmsResult.success) {
                            console.warn('Customer SMS failed:', customerSmsResult.error);
                        }

                        // Send notification SMS to business owner
                        if (businessPhone) {
                            const businessSmsResult = await smsService.sendBusinessNotification(appointmentDetails, businessPhone);
                            if (!businessSmsResult.success) {
                                console.warn('Business SMS failed:', businessSmsResult.error);
                            }
                        }
                    } catch (smsError) {
                        console.warn('SMS notification failed:', smsError);
                        // Don't fail the entire appointment if SMS fails
                    }
                }

                alert(`Appointment scheduled!\n\nCut: Volume 1 Cut ($20)\nDay: ${selectedDay}\nTime: ${selectedTime}\nLocation: ${isHouseCall ? `House Call (+$5) - ${address}` : 'At Location'}\n\nI'll reach out to you soon!${smsEnabled ? '\n\nYou should receive a confirmation text shortly.' : ''}`);
            } catch (error) {
                console.error('Appointment error:', error);
                alert('Appointment failed to schedule!');
            } finally {
                setIsSubmitting(false);
            }
            
            // Reset form
            setCutSelected(false);
            setSelectedDay('');
            setSelectedTime('');
            setIsHouseCall(false);
            setName('');
            setPhone('');
            setAddress('');
        } else {
            alert('Please fill in all required fields');
        }
    };

    return (
        <div className="container">
            <h1 className="title">
                Schedule an appointment
            </h1>
            
            <div className="formContainer">
                {/* Cut Selection */}
                <div className="fieldGroup">
                    <label className="label">cut:</label>
                    <div className="cutContainer">
                        <button
                            className={`cutButton ${cutSelected ? 'selected' : ''}`}
                            onClick={() => setCutSelected(!cutSelected)}
                            disabled={isSubmitting}
                        >
                            volume 1 cut - $20
                        </button>
                    </div>
                </div>

                {/* Availability Section - Only show if cut is selected */}
                {cutSelected && (
                    <div className="fieldGroup">
                        <label className="label">availability:</label>
                        <div className="availabilityContainer">
                            <div className="daysColumn">
                                {days.map(day => (
                                    <button
                                        key={day}
                                        className={`dayButton ${selectedDay === day ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedDay(day);
                                            setSelectedTime(''); // Reset time when day changes
                                        }}
                                        disabled={isSubmitting}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                            <div className="timesColumn">
                                {selectedDay && getTimeSlots(selectedDay).map(time => (
                                    <button
                                        key={time}
                                        className={`timeButton ${selectedTime === time ? 'selected' : ''}`}
                                        onClick={() => setSelectedTime(time)}
                                        disabled={isSubmitting}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Location Section - Only show if day and time are selected */}
                {cutSelected && selectedDay && selectedTime && (
                    <div className="fieldGroup">
                        <label className="label">location:</label>
                        <div className="locationContainer">
                            <button
                                className={`locationButton ${isHouseCall ? 'selected' : ''}`}
                                onClick={() => setIsHouseCall(true)}
                                disabled={isSubmitting}
                            >
                                house call (+$5)
                            </button>
                            <button
                                className={`locationButton ${!isHouseCall ? 'selected' : ''}`}
                                onClick={() => setIsHouseCall(false)}
                                disabled={isSubmitting}
                            >
                                at location
                            </button>
                        </div>
                    </div>
                )}

                {/* Contact Info Section - Only show if location is selected */}
                {cutSelected && selectedDay && selectedTime && (
                    <div className="fieldGroup">
                        <div className="contactRow">
                            <div className="contactField">
                                <label className="label">name:</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={isSubmitting}
                                    className="input"
                                />
                            </div>
                            <div className="contactField">
                                <label className="label">phone number:</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    disabled={isSubmitting}
                                    className="input"
                                    placeholder="Enter valid phone number"
                                />
                                {phone && !validatePhone(phone) && (
                                    <span className="errorText">Please enter a valid phone number</span>
                                )}
                            </div>
                            {isHouseCall && (
                                <div className="contactField">
                                    <label className="label">address:</label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        disabled={isSubmitting}
                                        className="input"
                                        placeholder="Enter your address"
                                    />
                                </div>
                            )}
                        </div>
                        
                        {/* SMS Notification Toggle */}
                        <div className="smsToggleContainer">
                            <label className="smsToggleLabel">
                                <input
                                    type="checkbox"
                                    checked={smsEnabled}
                                    onChange={(e) => setSmsEnabled(e.target.checked)}
                                    disabled={isSubmitting}
                                    className="smsToggle"
                                />
                                <span className="smsToggleText">
                                    📱 Send SMS confirmation (recommended)
                                </span>
                            </label>
                        </div>
                    </div>
                )}

                {/* Schedule Button */}
                <button
                    onClick={handleSchedule}
                    disabled={!isFormComplete() || isSubmitting}
                    className={`scheduleButton ${!isFormComplete() ? 'disabled' : ''}`}
                >
                    {isSubmitting ? 'Scheduling...' : 'Schedule'}
                </button>
            </div>
        </div>
    );
};

export default AppointmentMaker;