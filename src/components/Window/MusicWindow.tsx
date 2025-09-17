import React from 'react';
import './MusicWindow.css';

const MusicWindow: React.FC = () => {
    const musicServices = [
        {
            name: 'Spotify Music',
            url: 'https://open.spotify.com/artist/4pf6I2Hikzc9N7A36lKlrN?si=uwjBptUyQymSU4VZTz1fFg',
            icon: '/social-icons/spotify.png'
        },
        {
            name: 'Apple Music',
            url: 'https://music.apple.com/us/artist/juan-zhingre/1756562979',
            icon: '/social-icons/apple.png'
        },
        {
            name: 'Youtube Music',
            url: 'https://music.youtube.com/channel/UCtAbnEnfF5wnlBrmJWWEFRg',
            icon: '/social-icons/youtube.png'
        },
        {
            name: 'Amazon Music',
            url: 'https://music.amazon.com/artists/B0D96PWDCL/juan-zhingre?do=play&agent=googleAssistant&ref=dmm_seo_google_gkp_artists',
            icon: '/social-icons/amazon.png'
        }
    ];

    return (
        <div className="musicContainer">
            <div className="leftSection">
                <div className="profileCircle">
                    <img src="/social-icons/profile.jpg" alt="Profile" />
                </div>
                <div className="profileText">
                    hey this is my music<br />
                    hope you enjoy :)
                </div>
            </div>
            
            <div className="rightSection">
                <div className="serviceList">
                    {musicServices.map((service, index) => (
                        <a 
                            key={index} 
                            className="serviceItem"
                            href={service.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                        >
                            <img src={service.icon} alt={service.name} className="serviceIcon" />
                            {service.name}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MusicWindow;