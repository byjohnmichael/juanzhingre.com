import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import smsService from '../../services/smsService';
import edgeConfigService from '../../services/edgeConfigService';
import ConfirmationCode from './ConfirmationCode';
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
    const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, 1 = next week, etc.
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmationData, setConfirmationData] = useState<any>(null);
    const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Get current date and time
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute; // Convert to minutes for easier comparison
    
    // Calculate dates for the current week offset
    const getWeekDates = () => {
        const startOfWeek = new Date(now);
        const dayOfWeek = currentDay === 0 ? 6 : currentDay - 1; // Convert Sunday=0 to Monday=0
        startOfWeek.setDate(now.getDate() - dayOfWeek + (weekOffset * 7));
        
        const weekDates = [];
        for (let i = 0; i < 6; i++) { // Monday to Saturday
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            weekDates.push(date);
        }
        return weekDates;
    };
    
    const weekDates = getWeekDates();
    
    // Format date for display (M/D format)
    const formatDate = (date: Date) => {
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    // Load appointment availability
    const loadAppointmentAvailability = async () => {
        try {
            const startDate = weekDates[0].toISOString().split('T')[0];
            const endDate = weekDates[5].toISOString().split('T')[0];
            
            const result = await edgeConfigService.getAppointmentAvailability(startDate, endDate);
            if (result.success && result.slots) {
                const bookedSet = new Set();
                result.slots.forEach(slot => {
                    if (slot.status === 'confirmed' || slot.status === 'pending') {
                        bookedSet.add(`${slot.date}-${slot.time}`);
                    }
                });
                setBookedSlots(bookedSet);
            }
        } catch (error) {
            console.error('Failed to load appointment availability:', error);
        }
    };

    // Load availability when week changes
    React.useEffect(() => {
        loadAppointmentAvailability();
    }, [weekOffset]);
    
    // Check if a day is in the past
    const isDayInPast = (dayIndex: number) => {
        if (weekOffset > 0) return false; // Future weeks are never in the past
        const dayDate = weekDates[dayIndex];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dayDate < today;
    };
    
    // Check if a time slot is in the past
    const isTimeInPast = (dayIndex: number, time: string) => {
        if (weekOffset > 0) return false; // Future weeks are never in the past
        if (isDayInPast(dayIndex)) return true; // Past days are always in the past
        
        const dayDate = weekDates[dayIndex];
        const isToday = dayDate.toDateString() === now.toDateString();
        if (!isToday) return false;
        
        // Parse time (e.g., "4:00PM" -> 16:00)
        const timeMatch = time.match(/(\d+):(\d+)(AM|PM)/i);
        if (!timeMatch) return false;
        
        let hour = parseInt(timeMatch[1]);
        const minute = parseInt(timeMatch[2]);
        const ampm = timeMatch[3].toUpperCase();
        
        if (ampm === 'PM' && hour !== 12) hour += 12;
        if (ampm === 'AM' && hour === 12) hour = 0;
        
        const slotTime = hour * 60 + minute;
        return slotTime <= currentTime;
    };

    // Check if a time slot is booked
    const isTimeBooked = (dayIndex: number, time: string) => {
        const dayDate = weekDates[dayIndex];
        const dateString = dayDate.toISOString().split('T')[0];
        const slotKey = `${dateString}-${time}`;
        return bookedSlots.has(slotKey);
    };
    
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
                // Get the actual date for the selected day
                const selectedDayIndex = days.indexOf(selectedDay);
                const selectedDate = weekDates[selectedDayIndex];
                const formattedDate = formatDate(selectedDate);
                
                const appointmentDetails = {
                    name: name,
                    phone: phone,
                    cut: 'Volume 1 Cut',
                    day: selectedDay,
                    date: formattedDate,
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
                        if (customerSmsResult.success && customerSmsResult.confirmationCode) {
                            // Store confirmation data in Edge Config
                            const confirmationData = {
                                confirmationCode: customerSmsResult.confirmationCode,
                                appointmentDetails: appointmentDetails,
                                status: 'pending',
                                createdAt: new Date().toISOString(),
                                expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
                            };

                            await edgeConfigService.storeConfirmation(confirmationData);
                            
                            // Show confirmation code window
                            setConfirmationData(confirmationData);
                            setShowConfirmation(true);
                            return; // Don't show success message yet
                        } else {
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

    const handleConfirmationSuccess = (code: string) => {
        setShowConfirmation(false);
        alert(`Appointment confirmed!\n\nConfirmation Code: ${code}\n\nCut: Volume 1 Cut ($20)\nDay: ${selectedDay}\nTime: ${selectedTime}\nLocation: ${isHouseCall ? `House Call (+$5) - ${address}` : 'At Location'}\n\nI'll reach out to you soon!`);
        
        // Reset form
        setCutSelected(false);
        setSelectedDay('');
        setSelectedTime('');
        setIsHouseCall(false);
        setName('');
        setPhone('');
        setAddress('');
    };

    const handleConfirmationClose = () => {
        setShowConfirmation(false);
        setConfirmationData(null);
    };

    // Show confirmation window if needed
    if (showConfirmation && confirmationData) {
        return (
            <ConfirmationCode
                onClose={handleConfirmationClose}
                onConfirm={handleConfirmationSuccess}
                appointmentDetails={confirmationData}
            />
        );
    }

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
                                {days.map((day, index) => {
                                    const isPast = isDayInPast(index);
                                    return (
                                        <button
                                            key={day}
                                            className={`dayButton ${selectedDay === day ? 'selected' : ''} ${isPast ? 'disabled' : ''}`}
                                            onClick={() => {
                                                if (!isPast) {
                                                    setSelectedDay(day);
                                                    setSelectedTime(''); // Reset time when day changes
                                                }
                                            }}
                                            disabled={isSubmitting || isPast}
                                        >
                                            {day} {formatDate(weekDates[index])}
                                        </button>
                                    );
                                })}
                                
                                {/* Navigation buttons */}
                                <div className="weekNavigation">
                                    <button
                                        className="navButton"
                                        onClick={() => setWeekOffset(weekOffset - 1)}
                                        disabled={weekOffset === 0 || isSubmitting}
                                        title="Previous Week"
                                    >
                                        ←
                                    </button>
                                    <button
                                        className="navButton"
                                        onClick={() => setWeekOffset(weekOffset + 1)}
                                        disabled={isSubmitting}
                                        title="Next Week"
                                    >
                                        →
                                    </button>
                                </div>
                            </div>
                            <div className="timesColumn">
                                {selectedDay && getTimeSlots(selectedDay).map(time => {
                                    const selectedDayIndex = days.indexOf(selectedDay);
                                    const isPast = isTimeInPast(selectedDayIndex, time);
                                    const isBooked = isTimeBooked(selectedDayIndex, time);
                                    const isDisabled = isPast || isBooked;
                                    return (
                                        <button
                                            key={time}
                                            className={`timeButton ${selectedTime === time ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                                            onClick={() => {
                                                if (!isDisabled) {
                                                    setSelectedTime(time);
                                                }
                                            }}
                                            disabled={isSubmitting || isDisabled}
                                            title={isBooked ? 'This time slot is already booked' : ''}
                                        >
                                            {time}
                                        </button>
                                    );
                                })}
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