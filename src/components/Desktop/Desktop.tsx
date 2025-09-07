import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import Icon from '../Icon/Icon';
import Window from '../Window/Window';
import MusicInterface from '../Window/MusicInterface';
import PhotoGallery from '../Window/PhotoGallery';
import CollectionViewer from '../Window/CollectionViewer';
import FullImageViewer from '../Window/FullImageViewer';
import FolderContent from '../Window/FolderContent';
import DemosPlayer from '../Window/DemosPlayer';
import CreditsWindow from '../Window/CreditsWindow';
import AppointmentMaker from '../Window/AppointmentMaker';
import { Icon as IconType, Window as WindowType, DesktopState } from '../../types/desktop';
import { photoData } from '../../data/photos';

const DesktopContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background-image: url('/background.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  @media (max-width: 768px) {
    overflow-x: hidden;
    overflow-y: auto;
  }
`;

const Taskbar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(to bottom, #c0c0c0 0%, #a0a0a0 100%);
  border-top: 2px solid #ffffff;
  border-left: 2px solid #ffffff;
  border-right: 2px solid #808080;
  border-bottom: 2px solid #808080;
  display: flex;
  align-items: center;
  padding: 0 4px;
  z-index: 1000;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 768px) {
    height: 50px;
    padding: 0 8px;
  }
`;

const StartButton = styled.button`
  width: 80px;
  height: 32px;
  background: linear-gradient(to bottom, #c0c0c0 0%, #a0a0a0 100%);
  border: 2px solid #ffffff;
  border-right: 2px solid #808080;
  border-bottom: 2px solid #808080;
  border-left: 2px solid #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  margin-right: 8px;
  box-shadow: inset 1px 1px 0px rgba(255, 255, 255, 0.3);
  
  @media (max-width: 768px) {
    width: 90px;
    height: 40px;
    padding: 0 12px;
    margin-right: 12px;
    font-size: 14px;
  }
  
  &:active {
    background: linear-gradient(to bottom, #a0a0a0 0%, #c0c0c0 100%);
    border: 2px solid #808080;
    border-right: 2px solid #ffffff;
    border-bottom: 2px solid #ffffff;
    border-left: 2px solid #808080;
    box-shadow: inset 1px 1px 0px rgba(0, 0, 0, 0.3);
  }
`;

const TaskbarItems = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  
  @media (max-width: 768px) {
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const TaskbarItem = styled.div<{ isActive: boolean }>`
  height: 28px;
  min-width: 140px;
  background: ${props => props.isActive 
    ? 'linear-gradient(to bottom, #ffffff 0%, #e0e0e0 100%)' 
    : 'linear-gradient(to bottom, #e0e0e0 0%, #c0c0c0 100%)'
  };
  border: 2px solid #ffffff;
  border-right: 2px solid #808080;
  border-bottom: 2px solid #808080;
  border-left: 2px solid #ffffff;
  display: flex;
  align-items: center;
  padding: 0 8px;
  cursor: pointer;
  font-size: 11px;
  color: #000;
  box-shadow: ${props => props.isActive 
    ? 'inset 1px 1px 0px rgba(0, 0, 0, 0.1)' 
    : 'inset 1px 1px 0px rgba(255, 255, 255, 0.3)'
  };
  
  @media (max-width: 768px) {
    height: 40px;
    min-width: 120px;
    padding: 0 12px;
    font-size: 12px;
    flex-shrink: 0;
  }
  
  &:hover {
    background: linear-gradient(to bottom, #f0f0f0 0%, #d0d0d0 100%);
  }
`;

const TaskbarIcon = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 6px;
  image-rendering: pixelated;
`;

const StartMenu = styled.div<{ isOpen: boolean }>`
  position: fixed;
  bottom: 40px;
  left: 4px;
  width: 200px;
  background: #c0c0c0;
  border: 2px solid #ffffff;
  border-right: 2px solid #808080;
  border-bottom: 2px solid #808080;
  border-left: 2px solid #ffffff;
  box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.3);
  z-index: 1001;
  display: ${props => props.isOpen ? 'flex' : 'none'};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
`;

const StartMenuSidebar = styled.div`
  width: 40px;
  background: #000080;
  display: flex;
  align-items: center;
  justify-content: center;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  color: white;
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 1px;
`;

const StartMenuContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const StartMenuItem = styled.div`
  padding: 8px 16px;
  cursor: pointer;
  font-size: 12px;
  color: #000;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #000080;
    color: white;
  }
`;

const MenuItemIcon = styled.img`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
`;

const Clock = styled.div`
  height: 28px;
  min-width: 80px;
  background: linear-gradient(to bottom, #e0e0e0 0%, #c0c0c0 100%);
  border: 2px solid #ffffff;
  border-right: 2px solid #808080;
  border-bottom: 2px solid #808080;
  border-left: 2px solid #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #000;
  font-weight: bold;
  box-shadow: inset 1px 1px 0px rgba(255, 255, 255, 0.3);
  margin-left: auto;
`;

const BackgroundOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  pointer-events: none;
`;

const DesktopTitle = styled.div`
  position: absolute;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 48px;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
  z-index: 1;
  pointer-events: none;
  
  @media (max-width: 768px) {
    font-size: 32px;
    top: 20px;
    padding: 0 20px;
    text-align: center;
    word-wrap: break-word;
  }
`;

const Desktop: React.FC = () => {
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [desktopState, setDesktopState] = useState<DesktopState>({
          icons: [
        {
          id: 'music',
          name: 'music',
          type: 'folder',
          position: { x: 30, y: 100 },
          icon: '/icons/music.png',
          color: '#007AFF'
        },
        {
          id: 'the-archive',
          name: 'ishv4ra',
          type: 'folder',
          position: { x: 30, y: 200 },
          icon: '/icons/ishv4ra.png',
          color: '#8B4513'
        },
        {
          id: 'demos',
          name: 'demos',
          type: 'folder',
          position: { x: 30, y: 300 },
          icon: '/icons/demos.png',
          color: '#9C27B0'
        },
        {
          id: 'sculpter',
          name: 'playday cuts',
          type: 'folder',
          position: { x: 30, y: 400 },
          icon: '/icons/playdaycuts.png',
          color: '#FF6B6B'
        }
      ],
    windows: [],
    activeWindowId: null,
    background: 'dog-pattern'
  });

  // Effect to reposition icons for mobile on mount and resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        // Reposition icons horizontally at the top for mobile
        const iconSpacing = Math.min(90, (window.innerWidth - 40) / 4); // Responsive spacing
        setDesktopState(prev => ({
          ...prev,
          icons: prev.icons.map((icon, index) => ({
            ...icon,
            position: { 
              x: 20 + (index * iconSpacing), // Space icons horizontally with responsive spacing
              y: 20 // Position at the top
            }
          }))
        }));
      } else {
        // Reset to original vertical layout for desktop
        setDesktopState(prev => ({
          ...prev,
          icons: [
            { ...prev.icons[0], position: { x: 30, y: 100 } },
            { ...prev.icons[1], position: { x: 30, y: 200 } },
            { ...prev.icons[2], position: { x: 30, y: 300 } },
            { ...prev.icons[3], position: { x: 30, y: 400 } }
          ]
        }));
      }
    };

    // Set initial position
    handleResize();

    // Listen for resize events
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleIconMove = useCallback((iconId: string, x: number, y: number) => {
    setDesktopState(prev => {
      const iconIndex = prev.icons.findIndex(icon => icon.id === iconId);
      if (iconIndex === -1) return prev;
      
      const isMobile = window.innerWidth <= 768;
      let constrainedX = x;
      let constrainedY = y;
      
      if (isMobile) {
        // On mobile, constrain icons to stay within screen bounds
        const iconWidth = 100; // Approximate icon width
        const iconHeight = 100; // Approximate icon height
        const taskbarHeight = 50;
        
        constrainedX = Math.max(0, Math.min(x, window.innerWidth - iconWidth));
        constrainedY = Math.max(0, Math.min(y, window.innerHeight - iconHeight - taskbarHeight));
      }
      
      const newIcons = [...prev.icons];
      newIcons[iconIndex] = {
        ...newIcons[iconIndex],
        position: { x: constrainedX, y: constrainedY }
      };
      
      return {
        ...prev,
        icons: newIcons
      };
    });
  }, []);

  const handleOpenCollection = useCallback((collection: any) => {
    // Find the first photo in the collection
    const firstPhoto = photoData.find(photo => photo.collection === collection.id);
    
    if (firstPhoto) {
      const newWindow: WindowType = {
        id: `photo-${firstPhoto.id}`,
        title: `${firstPhoto.name}`,
        type: 'app',
        position: { x: 200, y: 200 },
        size: { width: 900, height: 700 },
        isMinimized: false,
        isMaximized: false,
        isOpen: true,
        zIndex: Date.now(),
        content: <FullImageViewer 
          photo={firstPhoto} 
          onClose={() => handleWindowClose(`photo-${firstPhoto.id}`)}
          onNavigate={(direction) => handlePhotoNavigate(firstPhoto, direction)}
        />
      };
      
      setDesktopState(prev => ({
        ...prev,
        windows: [...prev.windows, newWindow],
        activeWindowId: newWindow.id
      }));
    }
  }, []);

  const handleOpenPhoto = useCallback((photo: any) => {
    const newWindow: WindowType = {
      id: `photo-${photo.id}`,
      title: `${photo.name}`,
      type: 'app',
      position: { x: 200, y: 200 },
      size: { width: 900, height: 700 },
      isMinimized: false,
      isMaximized: false,
      isOpen: true,
      zIndex: Date.now(),
      content: <FullImageViewer 
        photo={photo} 
        onClose={() => handleWindowClose(`photo-${photo.id}`)}
        onNavigate={(direction) => handlePhotoNavigate(photo, direction)}
      />
    };
    
    setDesktopState(prev => ({
      ...prev,
      windows: [...prev.windows, newWindow],
      activeWindowId: newWindow.id
    }));
  }, []);

  const handleOpenCredits = useCallback(() => {
    const newWindow: WindowType = {
      id: 'credits-window',
      title: 'Origins',
      type: 'app',
      position: { x: 300, y: 200 },
      size: { width: 400, height: 300 },
      isMinimized: false,
      isMaximized: false,
      isOpen: true,
      zIndex: Date.now(),
      content: <CreditsWindow onClose={() => handleWindowClose('credits-window')} />
    };
    
    setDesktopState(prev => ({
      ...prev,
      windows: [...prev.windows, newWindow],
      activeWindowId: newWindow.id
    }));
  }, []);

  const handlePhotoNavigate = useCallback((currentPhoto: any, direction: 'prev' | 'next') => {
    // Find the next/previous photo in the same collection
    const photos = photoData.filter(p => p.collection === currentPhoto.collection);
    const currentIndex = photos.findIndex(p => p.id === currentPhoto.id);
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    // Wrap around
    if (newIndex < 0) newIndex = photos.length - 1;
    if (newIndex >= photos.length) newIndex = 0;
    
    const newPhoto = photos[newIndex];
    
    // Update the current photo window with the new photo
    setDesktopState(prev => {
      const newWindows = prev.windows.map(w => {
        if (w.id === `photo-${currentPhoto.id}`) {
          return {
            ...w,
            id: `photo-${newPhoto.id}`, // Update the window ID to match the new photo
            title: `${newPhoto.name}`,
            content: <FullImageViewer 
              photo={newPhoto} 
              onClose={() => handleWindowClose(`photo-${newPhoto.id}`)}
              onNavigate={(dir) => handlePhotoNavigate(newPhoto, dir)}
            />
          };
        }
        return w;
      });
      
      return {
        ...prev,
        windows: newWindows
      };
    });
  }, []);

  const handleIconClick = useCallback((icon: IconType) => {
    // Check if app is already running
    const existingWindow = desktopState.windows.find(window => 
      window.id.startsWith(`${icon.id}-`) || window.id === `window-${icon.id}`
    );

    if (existingWindow) {
      // If app is already running, bring it to focus and unminimize if needed
      if (existingWindow.isMinimized) {
        setDesktopState(prev => ({
          ...prev,
          windows: prev.windows.map(w => 
            w.id === existingWindow.id ? { ...w, isMinimized: false } : w
          ),
          activeWindowId: existingWindow.id
        }));
      } else {
        // Just bring to focus
        setDesktopState(prev => ({
          ...prev,
          activeWindowId: existingWindow.id,
          windows: prev.windows.map(w => ({
            ...w,
            zIndex: w.id === existingWindow.id ? Date.now() : w.zIndex
          }))
        }));
      }
      return;
    }

    if (icon.id === 'music') {
      // Open music window
      const isMobile = window.innerWidth <= 768;
      const newWindow: WindowType = {
        id: `music-${Date.now()}`,
        title: 'Music',
        type: 'app',
        position: isMobile ? { x: 10, y: 10 } : { x: 150, y: 150 },
        size: isMobile ? { width: window.innerWidth - 20, height: window.innerHeight - 100 } : { width: 600, height: 500 },
        isMinimized: false,
        isMaximized: false,
        isOpen: true,
        zIndex: Date.now(),
        content: <MusicInterface />
      };
      
      setDesktopState(prev => ({
        ...prev,
        windows: [...prev.windows, newWindow],
        activeWindowId: newWindow.id
      }));
    } else if (icon.id === 'the-archive') {
      // Open photo gallery for the Archive icon
      const isMobile = window.innerWidth <= 768;
      const newWindow: WindowType = {
        id: `window-${icon.id}`,
        title: 'ishv4ra',
        type: 'app',
        position: isMobile ? { x: 10, y: 10 } : { x: 100, y: 100 },
        size: isMobile ? { width: window.innerWidth - 20, height: window.innerHeight - 100 } : { width: 1000, height: 700 },
        isMinimized: false,
        isMaximized: false,
        isOpen: true,
        zIndex: Date.now(),
        content: <PhotoGallery onOpenCollection={handleOpenCollection} />
      };
      
      setDesktopState(prev => ({
        ...prev,
        windows: [...prev.windows, newWindow],
        activeWindowId: newWindow.id
      }));
    } else if (icon.id === 'demos') {
      // Open demos player
      const isMobile = window.innerWidth <= 768;
      const newWindow: WindowType = {
        id: `window-${icon.id}`,
        title: icon.name,
        type: 'app',
        position: isMobile ? { x: 10, y: 10 } : { x: 100, y: 100 },
        size: isMobile ? { width: window.innerWidth - 20, height: window.innerHeight - 100 } : { width: 800, height: 500 },
        isMinimized: false,
        isMaximized: false,
        isOpen: true,
        zIndex: Date.now(),
        content: <DemosPlayer />
      };
      
      setDesktopState(prev => ({
        ...prev,
        windows: [...prev.windows, newWindow],
        activeWindowId: newWindow.id
      }));
    } else if (icon.id === 'sculpter') {
      // Open appointment maker for playday cuts
      const isMobile = window.innerWidth <= 768;
      const newWindow: WindowType = {
        id: `window-${icon.id}`,
        title: icon.name,
        type: 'app',
        position: isMobile ? { x: 10, y: 10 } : { x: 200, y: 150 },
        size: isMobile ? { width: window.innerWidth - 20, height: window.innerHeight - 100 } : { width: 500, height: 600 },
        isMinimized: false,
        isMaximized: false,
        isOpen: true,
        zIndex: Date.now(),
        content: <AppointmentMaker onClose={() => handleWindowClose(`window-${icon.id}`)} />
      };
      
      setDesktopState(prev => ({
        ...prev,
        windows: [...prev.windows, newWindow],
        activeWindowId: newWindow.id
      }));
    } else if (icon.type === 'folder') {
      // Open folder window with custom content
      const newWindow: WindowType = {
        id: `window-${icon.id}`,
        title: icon.name,
        type: 'folder',
        position: { x: 100, y: 100 },
        size: { width: 600, height: 400 },
        isMinimized: false,
        isMaximized: false,
        isOpen: true,
        zIndex: Date.now(),
        content: <FolderContent folderId={icon.id} folderName={icon.name} />
      };
      
      setDesktopState(prev => ({
        ...prev,
        windows: [...prev.windows, newWindow],
        activeWindowId: newWindow.id
      }));
    } else if (icon.type === 'app') {
      // Open app window
      const newWindow: WindowType = {
        id: `window-${icon.id}`,
        title: icon.name,
        type: 'app',
        position: { x: 150, y: 150 },
        size: { width: 800, height: 600 },
        isMinimized: false,
        isMaximized: false,
        isOpen: true,
        zIndex: Date.now(),
        content: <div>Welcome to {icon.name}!</div>
      };
      
      setDesktopState(prev => ({
        ...prev,
        windows: [...prev.windows, newWindow],
        activeWindowId: newWindow.id
      }));
    }
  }, [desktopState.windows]);

  const handleWindowClose = useCallback((windowId: string) => {
    setDesktopState(prev => ({
      ...prev,
      windows: prev.windows.filter(w => w.id !== windowId),
      activeWindowId: prev.activeWindowId === windowId ? null : prev.activeWindowId
    }));
  }, []);

  const handleWindowMinimize = useCallback((windowId: string) => {
    setDesktopState(prev => ({
      ...prev,
      windows: prev.windows.map(w => 
        w.id === windowId ? { ...w, isMinimized: !w.isMinimized } : w
      )
    }));
  }, []);

  const handleWindowMaximize = useCallback((windowId: string) => {
    setDesktopState(prev => ({
      ...prev,
      windows: prev.windows.map(w => 
        w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w
      )
    }));
  }, []);

  const handleWindowMove = useCallback((windowId: string, x: number, y: number) => {
    // Use functional update to avoid stale state issues
    setDesktopState(prev => {
      const windowIndex = prev.windows.findIndex(w => w.id === windowId);
      if (windowIndex === -1) return prev;
      
      const newWindows = [...prev.windows];
      newWindows[windowIndex] = {
        ...newWindows[windowIndex],
        position: { x, y }
      };
      
      return {
        ...prev,
        windows: newWindows
      };
    });
  }, []);

  const handleWindowResize = useCallback((windowId: string, width: number, height: number) => {
    setDesktopState(prev => ({
      ...prev,
      windows: prev.windows.map(w => 
        w.id === windowId ? { ...w, size: { width, height } } : w
      )
    }));
  }, []);

  const handleDesktopClick = useCallback((e: React.MouseEvent) => {
    // Don't close menu if clicking on start button or start menu
    if (e.target instanceof HTMLElement) {
      if (e.target.closest('[data-start-button]') || e.target.closest('[data-start-menu]')) {
        return;
      }
    }
    setIsStartMenuOpen(false);
  }, []);

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Denver',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      const mountainTime = formatter.format(now);
      setCurrentTime(`${mountainTime} MST`);
    };

    updateTime(); // Update immediately
    const interval = setInterval(updateTime, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  return (
    <DesktopContainer onClick={handleDesktopClick}>
      <>
        <BackgroundOverlay />
      
      {/* Desktop Icons */}
      {desktopState.icons.map(icon => (
        <Icon
          key={icon.id}
          icon={icon}
          onClick={() => handleIconClick(icon)}
          onMove={handleIconMove}
          isSelected={false}
        />
      ))}
      
      {/* Windows */}
      {desktopState.windows.map(window => (
        <Window
          key={window.id}
          window={window}
          onClose={handleWindowClose}
          onMinimize={handleWindowMinimize}
          onMaximize={handleWindowMaximize}
          onMove={handleWindowMove}
          onResize={handleWindowResize}
          onFocus={(windowId) => {
            setDesktopState(prev => ({
              ...prev,
              activeWindowId: windowId,
              windows: prev.windows.map(w => ({
                ...w,
                zIndex: w.id === windowId ? Date.now() : w.zIndex
              }))
            }));
          }}
        >
          {window.content}
        </Window>
      ))}

      {/* Taskbar */}
      <Taskbar>
        <StartButton 
          data-start-button
          onClick={() => {
            console.log('Start button clicked, current state:', isStartMenuOpen);
            setIsStartMenuOpen(!isStartMenuOpen);
          }}
        >
          <img 
            src="/icons/startmenu.png" 
            alt="Start" 
            style={{ 
              width: '16px', 
              height: '16px',
              imageRendering: 'pixelated'
            }} 
          />
          <span style={{ 
            color: 'white', 
            fontWeight: 'bold', 
            fontSize: '12px',
            textShadow: '1px 1px 1px rgba(0, 0, 0, 0.5)'
          }}>
            Start
          </span>
        </StartButton>
        
        <TaskbarItems>
          {desktopState.windows
            .filter(window => !window.isMinimized)
            .map(window => {
              // Get the icon for this window type
              let iconSrc = '';
              if (window.id.startsWith('music-')) {
                iconSrc = '/icons/music.png';
              } else if (window.id === 'window-the-archive') {
                iconSrc = '/icons/ishv4ra.png';
              } else if (window.id === 'window-demos') {
                iconSrc = '/icons/demos.png';
              } else if (window.id === 'window-sculpter') {
                iconSrc = '/icons/playdaycuts.png';
              }
              
              return (
                <TaskbarItem
                  key={window.id}
                  isActive={desktopState.activeWindowId === window.id}
                  onClick={() => {
                    setDesktopState(prev => ({
                      ...prev,
                      activeWindowId: window.id,
                      windows: prev.windows.map(w => {
                        if (w.id === window.id) {
                          return {
                            ...w,
                            zIndex: Date.now(),
                            isMinimized: false // Ensure window is not minimized
                          };
                        }
                        return w;
                      })
                    }));
                  }}
                >
                  {iconSrc && <TaskbarIcon src={iconSrc} alt="" />}
                  {window.title}
                </TaskbarItem>
              );
            })}
        </TaskbarItems>
        
        <Clock>
          {currentTime}
        </Clock>
      </Taskbar>

      {/* Start Menu */}
      {console.log('Rendering StartMenu with isOpen:', isStartMenuOpen)}
      <StartMenu isOpen={isStartMenuOpen} data-start-menu>
        <StartMenuSidebar>
          start menu
        </StartMenuSidebar>
        <StartMenuContent>
          <StartMenuItem 
            onClick={() => {
              window.open('https://www.instagram.com/juan.zhingre/', '_blank');
              setIsStartMenuOpen(false);
            }}
          >
            <MenuItemIcon src="/icons/instagram.png" alt="Instagram" />
            juan.zhingre
          </StartMenuItem>
          <StartMenuItem 
            onClick={() => {
              window.open('https://www.instagram.com/ishv4ra/', '_blank');
              setIsStartMenuOpen(false);
            }}
          >
            <MenuItemIcon src="/icons/instagram.png" alt="Instagram" />
            ishv4ra
          </StartMenuItem>
          <div style={{ height: '1px', background: '#808080', margin: '2px 0' }}></div>
          <StartMenuItem onClick={() => {
            handleOpenCredits();
            setIsStartMenuOpen(false);
          }}>
            Origins
          </StartMenuItem>
          <div style={{ height: '1px', background: '#808080', margin: '2px 0' }}></div>
          <StartMenuItem onClick={() => {
            setIsStartMenuOpen(false);
            window.close();
          }}>
            <MenuItemIcon src="/icons/startmenu.png" alt="Shutdown" />
            Shut Down...
          </StartMenuItem>
        </StartMenuContent>
      </StartMenu>
      </>
    </DesktopContainer>
  );
};

export default Desktop;
