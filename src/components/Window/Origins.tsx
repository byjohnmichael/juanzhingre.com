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
                    Directed and creative decisions made<br />
                    <strong>
                        <a 
                            href="https://byjohmichael.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                                textDecoration: 'underline', 
                                color: '#000',
                                textDecorationColor: '#000'
                            }}
                        >
                            By John Michael
                        </a>
                    </strong>
                </div>
                <div>
                    Produced and creative decisions approved<br />
                    <strong>by Juan Zhingre</strong>
                </div>
            </div>
        </div>
    );
};

export default CreditsWindow;
