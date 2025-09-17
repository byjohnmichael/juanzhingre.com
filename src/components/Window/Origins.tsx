import React from 'react';
import './Origins.css';

interface CreditsWindowProps {
    onClose: () => void;
}

const CreditsWindow: React.FC<CreditsWindowProps> = ({ onClose }) => {
    return (
        <div className="container">
            <h1 className="title">
                Origins
            </h1>
            
            <div className="content">
                <div className="creditSection">
                    Directed and creative decisions made<br />
                    <strong>
                        <a 
                            href="https://byjohmichael.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="link"
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