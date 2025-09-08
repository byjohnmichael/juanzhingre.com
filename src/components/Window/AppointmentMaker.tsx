import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

interface AppointmentMakerProps {
    onClose: () => void;
}

const AppointmentMaker: React.FC<AppointmentMakerProps> = ({ onClose }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeSlots = ['Morning', 'Afternoon', 'Evening'];

    const handleDayToggle = (day: string) => {
        setSelectedDays(prev => 
            prev.includes(day) 
                ? prev.filter(d => d !== day)
                : [...prev, day]
        );
    };

    const handleTimeToggle = (time: string) => {
        setSelectedTimes(prev => 
            prev.includes(time) 
                ? prev.filter(t => t !== time)
                : [...prev, time]
        );
    };

    const handleSchedule = async () => {
        if (name && phone && selectedDays.length > 0 && selectedTimes.length > 0) {
            setIsSubmitting(true);
            
            try {
                // Send email using EmailJS
                const templateParams = {
                    name: name,
                    time: selectedTimes.join(', '),
                    message: `${name} wants a cut, this is their phone number: ${phone}\n\nAvailable Days: ${selectedDays.join(', ')}\nTime Preference: ${selectedTimes.join(', ')}`
                };

                await emailjs.send(
                    'service_li6pxqa',
                    'template_i1lmcnm',
                    templateParams,
                    'gyiS7YPcgxpQGxBch'
                );

                alert(`Appointment scheduled!\nName: ${name}\nPhone: ${phone}\nDays: ${selectedDays.join(', ')}\nTime: ${selectedTimes.join(', ')}\n\nI'll reach out to you soon!`);
            } catch (error) {
                console.error('Email error:', error);
                alert(`Appointment failed to scheduled!.`);
            } finally {
                setIsSubmitting(false);
            }
            
            // Reset form
            setName('');
            setPhone('');
            setSelectedDays([]);
            setSelectedTimes([]);
        } else {
            alert('Please fill in all fields');
        }
    };

    return (
        <div style={{ 
            height: '100%', 
            padding: '20px',
            background: '#c0c0c0',
            fontFamily: 'Arial, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            overflow: 'auto'
        }}>
            <h1 style={{
                fontSize: window.innerWidth <= 768 ? '20px' : '24px',
                fontWeight: 'bold',
                margin: '0 0 20px 0',
                color: '#000',
                textAlign: 'center',
                lineHeight: '1.2'
            }}>
                Schedule an appointment
            </h1>
            
            <div style={{
                width: '100%',
                maxWidth: window.innerWidth <= 768 ? '100%' : '400px',
                display: 'flex',
                flexDirection: 'column',
                gap: window.innerWidth <= 768 ? '15px' : '20px'
            }}>
                {/* Name Field */}
                <div>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '5px', 
                        fontWeight: 'bold',
                        fontSize: window.innerWidth <= 768 ? '16px' : '14px'
                    }}>
                        Name:
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isSubmitting}
                        style={{
                            width: '100%',
                            padding: window.innerWidth <= 768 ? '12px' : '8px',
                            border: '2px solid #808080',
                            borderTop: '2px solid #ffffff',
                            borderLeft: '2px solid #ffffff',
                            background: isSubmitting ? '#f0f0f0' : '#ffffff',
                            fontSize: window.innerWidth <= 768 ? '16px' : '14px',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                {/* Phone Field */}
                <div>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '5px', 
                        fontWeight: 'bold',
                        fontSize: window.innerWidth <= 768 ? '16px' : '14px'
                    }}>
                        Phone Number:
                    </label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={isSubmitting}
                        style={{
                            width: '100%',
                            padding: window.innerWidth <= 768 ? '12px' : '8px',
                            border: '2px solid #808080',
                            borderTop: '2px solid #ffffff',
                            borderLeft: '2px solid #ffffff',
                            background: isSubmitting ? '#f0f0f0' : '#ffffff',
                            fontSize: window.innerWidth <= 768 ? '16px' : '14px',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                {/* Availability Days */}
                <div>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '10px', 
                        fontWeight: 'bold',
                        fontSize: window.innerWidth <= 768 ? '16px' : '14px'
                    }}>
                        Availability:
                    </label>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(2, 1fr)',
                        gap: window.innerWidth <= 768 ? '12px' : '8px'
                    }}>
                        {days.map(day => (
                            <label key={day} style={{
                                display: 'flex',
                                alignItems: 'center',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                fontSize: window.innerWidth <= 768 ? '16px' : '14px',
                                padding: window.innerWidth <= 768 ? '12px 16px' : '8px 12px',
                                borderRadius: '4px',
                                transition: 'all 0.2s',
                                opacity: isSubmitting ? 0.6 : 1,
                                backgroundColor: selectedDays.includes(day) ? '#e8f5e8' : 'transparent',
                                border: selectedDays.includes(day) ? '2px solid #4CAF50' : '2px solid transparent',
                                fontWeight: selectedDays.includes(day) ? 'bold' : 'normal',
                                minHeight: window.innerWidth <= 768 ? '48px' : 'auto'
                            }}
                            onMouseEnter={(e) => {
                                if (!isSubmitting) {
                                    e.currentTarget.style.backgroundColor = selectedDays.includes(day) ? '#d4edda' : '#f0f0f0';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = selectedDays.includes(day) ? '#e8f5e8' : 'transparent';
                            }}>
                                <input
                                    type="checkbox"
                                    checked={selectedDays.includes(day)}
                                    onChange={() => handleDayToggle(day)}
                                    disabled={isSubmitting}
                                    style={{
                                        marginRight: '10px',
                                        width: window.innerWidth <= 768 ? '24px' : '18px',
                                        height: window.innerWidth <= 768 ? '24px' : '18px',
                                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                        accentColor: '#4CAF50',
                                        transform: window.innerWidth <= 768 ? 'scale(1.5)' : 'scale(1.2)'
                                    }}
                                />
                                {day}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Time Selection */}
                <div>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '10px', 
                        fontWeight: 'bold',
                        fontSize: window.innerWidth <= 768 ? '16px' : '14px'
                    }}>
                        Time Preference:
                    </label>
                    <div style={{
                        display: 'flex',
                        gap: window.innerWidth <= 768 ? '12px' : '10px',
                        flexWrap: 'wrap'
                    }}>
                        {timeSlots.map(time => (
                            <label key={time} style={{
                                display: 'flex',
                                alignItems: 'center',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                fontSize: window.innerWidth <= 768 ? '16px' : '14px',
                                padding: window.innerWidth <= 768 ? '12px 16px' : '8px 12px',
                                borderRadius: '4px',
                                transition: 'all 0.2s',
                                opacity: isSubmitting ? 0.6 : 1,
                                backgroundColor: selectedTimes.includes(time) ? '#e8f5e8' : 'transparent',
                                border: selectedTimes.includes(time) ? '2px solid #4CAF50' : '2px solid transparent',
                                fontWeight: selectedTimes.includes(time) ? 'bold' : 'normal',
                                minHeight: window.innerWidth <= 768 ? '48px' : 'auto'
                            }}
                            onMouseEnter={(e) => {
                                if (!isSubmitting) {
                                    e.currentTarget.style.backgroundColor = selectedTimes.includes(time) ? '#d4edda' : '#f0f0f0';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = selectedTimes.includes(time) ? '#e8f5e8' : 'transparent';
                            }}>
                                <input
                                    type="checkbox"
                                    checked={selectedTimes.includes(time)}
                                    onChange={() => handleTimeToggle(time)}
                                    disabled={isSubmitting}
                                    style={{
                                        marginRight: '10px',
                                        width: window.innerWidth <= 768 ? '24px' : '18px',
                                        height: window.innerWidth <= 768 ? '24px' : '18px',
                                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                        accentColor: '#4CAF50',
                                        transform: window.innerWidth <= 768 ? 'scale(1.5)' : 'scale(1.2)'
                                    }}
                                />
                                {time}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Schedule Button */}
                <button
                    onClick={handleSchedule}
                    disabled={isSubmitting}
                    style={{
                        padding: window.innerWidth <= 768 ? '16px 32px' : '12px 24px',
                        background: isSubmitting ? '#cccccc' : '#4CAF50',
                        color: 'white',
                        border: '2px solid #ffffff',
                        borderRight: '2px solid #808080',
                        borderBottom: '2px solid #808080',
                        borderLeft: '2px solid #ffffff',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        fontSize: window.innerWidth <= 768 ? '18px' : '16px',
                        fontWeight: 'bold',
                        alignSelf: 'center',
                        boxShadow: 'inset 1px 1px 0px rgba(255, 255, 255, 0.3)',
                        marginTop: '10px',
                        minHeight: window.innerWidth <= 768 ? '56px' : 'auto',
                        minWidth: window.innerWidth <= 768 ? '200px' : 'auto'
                    }}
                    onMouseEnter={(e) => {
                        if (!isSubmitting) {
                            e.currentTarget.style.background = '#45a049';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isSubmitting) {
                            e.currentTarget.style.background = '#4CAF50';
                        }
                    }}
                >
                    {isSubmitting ? 'Scheduling...' : 'Schedule'}
                </button>
            </div>
        </div>
    );
}; export default AppointmentMaker;