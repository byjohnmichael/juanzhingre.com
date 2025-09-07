import React from 'react';
import styled from 'styled-components';

const MusicContainer = styled.div`
  display: flex;
  height: 100%;
  max-width: 600px;
  margin: 0 auto;
  background:rgb(184, 184, 184);
  border: 2px solid black;
  font-family: 'Courier New', monospace;
`;

const LeftSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
`;

const ProfileCircle = styled.div`
  width: 120px;
  height: 120px;
  border: 2px solid black;
  border-radius: 50%;
  margin-bottom: 30px;
  background: white;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProfileText = styled.div`
  text-align: center;
  font-size: 16px;
  line-height: 1.4;
  color: black;
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 40px 20px;
  justify-content: center;
`;

const ServiceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const ServiceItem = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: black;
  font-size: 16px;
  padding: 8px 0;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const ServiceIcon = styled.img`
  width: 24px;
  height: 24px;
  flex-shrink: 0;
`;

const MusicInterface: React.FC = () => {
  const musicServices = [
    {
      name: 'Spotify Music',
      url: 'https://open.spotify.com/artist/4pf6I2Hikzc9N7A36lKlrN?si=uwjBptUyQymSU4VZTz1fFg',
      icon: '/streaming-icons/spotify.png'
    },
    {
      name: 'Apple Music',
      url: 'https://music.apple.com/us/artist/juan-zhingre/1756562979',
      icon: '/streaming-icons/apple.png'
    },
    {
      name: 'Youtube Music',
      url: 'https://music.youtube.com/channel/UCtAbnEnfF5wnlBrmJWWEFRg',
      icon: '/streaming-icons/youtube.png'
    },
    {
      name: 'Amazon Music',
      url: 'https://music.amazon.com/artists/B0D96PWDCL/juan-zhingre?do=play&agent=googleAssistant&ref=dmm_seo_google_gkp_artists',
      icon: '/streaming-icons/amazon.png'
    }
  ];

  return (
    <MusicContainer>
      <LeftSection>
        <ProfileCircle>
          <img src="/icons/profile.jpg" alt="Profile" />
        </ProfileCircle>
        <ProfileText>
          hey this is my music<br />
          hope you enjoy :)
        </ProfileText>
      </LeftSection>
      
      <RightSection>
        <ServiceList>
          {musicServices.map((service, index) => (
            <ServiceItem 
              key={index} 
              href={service.url} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ServiceIcon src={service.icon} alt={service.name} />
              {service.name}
            </ServiceItem>
          ))}
        </ServiceList>
      </RightSection>
    </MusicContainer>
  );
};

export default MusicInterface;
