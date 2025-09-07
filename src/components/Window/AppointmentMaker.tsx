import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

interface AppointmentMakerProps {
  onClose: () => void;
}

const AppointmentMaker: React.FC<AppointmentMakerProps> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState('');
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

  const handleSchedule = async () => {
    if (name && phone && selectedDays.length > 0 && selectedTime) {
      setIsSubmitting(true);
      
      try {
        // Send email using EmailJS
        const templateParams = {
          name: name,
          time: selectedTime,
          message: `${name} wants a cut, this is their phone number: ${phone}\n\nAvailable Days: ${selectedDays.join(', ')}\nTime Preference: ${selectedTime}`
        };

        await emailjs.send(
          'service_li6pxqa', // Replace with your EmailJS service ID
          'template_i1lmcnm', // Replace with your EmailJS template ID
          templateParams,
          'gyiS7YPcgxpQGxBch' // Replace with your EmailJS public key
        );

        alert(`Appointment scheduled!\nName: ${name}\nPhone: ${phone}\nDays: ${selectedDays.join(', ')}\nTime: ${selectedTime}\n\nEmail notification sent!`);
      } catch (error) {
        console.error('Email error:', error);
        alert(`Appointment scheduled!\nName: ${name}\nPhone: ${phone}\nDays: ${selectedDays.join(', ')}\nTime: ${selectedTime}\n\nNote: Email notification failed to send.`);
      } finally {
        setIsSubmitting(false);
      }
      
      // Reset form
      setName('');
      setPhone('');
      setSelectedDays([]);
      setSelectedTime('');
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
        fontSize: '24px',
        fontWeight: 'bold',
        margin: '0 0 30px 0',
        color: '#000',
        textAlign: 'center'
      }}>
        Schedule an appointment
      </h1>
      
      <div style={{
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Name Field */}
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '5px', 
            fontWeight: 'bold',
            fontSize: '14px'
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
              padding: '8px',
              border: '2px solid #808080',
              borderTop: '2px solid #ffffff',
              borderLeft: '2px solid #ffffff',
              background: isSubmitting ? '#f0f0f0' : '#ffffff',
              fontSize: '14px',
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
            fontSize: '14px'
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
              padding: '8px',
              border: '2px solid #808080',
              borderTop: '2px solid #ffffff',
              borderLeft: '2px solid #ffffff',
              background: isSubmitting ? '#f0f0f0' : '#ffffff',
              fontSize: '14px',
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
            fontSize: '14px'
          }}>
            Availability:
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px'
          }}>
            {days.map(day => (
              <label key={day} style={{
                display: 'flex',
                alignItems: 'center',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                padding: '4px 8px',
                borderRadius: '4px',
                transition: 'background-color 0.2s',
                opacity: isSubmitting ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#f0f0f0';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}>
                <input
                  type="checkbox"
                  checked={selectedDays.includes(day)}
                  onChange={() => handleDayToggle(day)}
                  disabled={isSubmitting}
                  style={{
                    marginRight: '8px',
                    width: '16px',
                    height: '16px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    accentColor: '#4CAF50'
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
            fontSize: '14px'
          }}>
            Time Preference:
          </label>
          <div style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            {timeSlots.map(time => (
              <label key={time} style={{
                display: 'flex',
                alignItems: 'center',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                padding: '4px 8px',
                borderRadius: '4px',
                transition: 'background-color 0.2s',
                opacity: isSubmitting ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#f0f0f0';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}>
                <input
                  type="radio"
                  name="time"
                  value={time}
                  checked={selectedTime === time}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  disabled={isSubmitting}
                  style={{
                    marginRight: '5px',
                    width: '16px',
                    height: '16px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    accentColor: '#4CAF50'
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
            padding: '12px 24px',
            background: isSubmitting ? '#cccccc' : '#4CAF50',
            color: 'white',
            border: '2px solid #ffffff',
            borderRight: '2px solid #808080',
            borderBottom: '2px solid #808080',
            borderLeft: '2px solid #ffffff',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            alignSelf: 'center',
            boxShadow: 'inset 1px 1px 0px rgba(255, 255, 255, 0.3)',
            marginTop: '10px'
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
};

export default AppointmentMaker;