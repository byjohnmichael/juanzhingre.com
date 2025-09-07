import React from 'react';

interface CreditsWindowProps {
  onClose: () => void;
}

const CreditsWindow: React.FC<CreditsWindowProps> = ({ onClose }) => {
  return (
    <div style={{ 
      height: '100%', 
      padding: '20px',
      background: '#c0c0c0',
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        textDecoration: 'underline',
        margin: '0 0 30px 0',
        color: '#000',
        textAlign: 'center'
      }}>
        Origins
      </h1>
      
      <div style={{
        fontSize: '16px',
        lineHeight: '1.8',
        color: '#000',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '15px' }}>
          <strong>Producer:</strong> Juan Zhingre
        </div>
        <div>
          <strong>Creative Director:</strong> John Michael
        </div>
      </div>
    </div>
  );
};

export default CreditsWindow;
