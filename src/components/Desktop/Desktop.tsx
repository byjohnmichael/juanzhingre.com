import { Icon as IconType, Window as WindowType, DesktopState } from '../../types/desktop';
import React, { useState, useCallback, useEffect } from 'react';
import AppointmentMaker from '../Window/AppointmentMaker';
import FullImageViewer from '../Window/FullImageViewer';
import PhotoGallery from '../Window/PhotoGallery';
import MusicWindow from '../Window/MusicWindow';
import CreditsWindow from '../Window/Origins';
import DemoPlayer from '../Window/DemoPlayer';
import { photoData } from '../../data/photos';
import Window from '../Window/Window';
import Icon from '../Icon/Icon';
import './Desktop.css';

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
                id: 'ishv4ra',
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
                id: 'playday',
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
                const iconSpacing = Math.min(90, (window.innerWidth - 40) / 4);
                setDesktopState(prev => ({ 
                    ...prev, icons: prev.icons.map((icon, index) => ({ ...icon, position: { x: 20 + (index * iconSpacing), y: 20 }}))
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
                content: <MusicWindow />
            };

            setDesktopState(prev => ({
                ...prev,
                windows: [...prev.windows, newWindow],
                activeWindowId: newWindow.id
            }));
        } else if (icon.id === 'ishv4ra') {
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
                content: <DemoPlayer />
            };

            setDesktopState(prev => ({
                ...prev,
                windows: [...prev.windows, newWindow],
                activeWindowId: newWindow.id
            }));
        } else if (icon.id === 'playday') {
            const isMobile = window.innerWidth <= 768;
            const newWindow: WindowType = {
                id: `window-${icon.id}`,
                title: icon.name,
                type: 'app',
                position: isMobile ? { x: 10, y: 10 } : { x: 200, y: 150 },
                size: isMobile ? { width: window.innerWidth - 20, height: window.innerHeight - 100 } : { width: 500, height: 750 },
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
        }  else if (icon.type === 'app') {
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
    }, [desktopState.windows, handleOpenCollection]);

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
                hour12: true
            });
            
            const mountainTime = formatter.format(now);
            setCurrentTime(mountainTime);
        };

        updateTime(); // Update immediately
        const interval = setInterval(updateTime, 1000); // Update every second

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="desktopContainer" onClick={handleDesktopClick}>
            <>
                <div className="backgroundOverlay"/>

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
                <div className="taskbar">
                    <button 
                        className="startButton"
                        data-start-button
                        onClick={() => {
                            console.log('Start button clicked, current state:', isStartMenuOpen);
                            setIsStartMenuOpen(!isStartMenuOpen);
                        }}
                    >
                        <img 
                            src="/icons/startmenu.png" 
                            alt="Start" 
                            className="startButtonIcon"
                        />
                        <span className="startButtonText">
                            Start
                        </span>
                    </button>

                    <div className="taskbarItems">
                        {desktopState.windows
                            .filter(window => !window.isMinimized)
                            .map(window => {
                                // Get the icon for this window type
                                let iconSrc = '';
                                if (window.id.startsWith('music-')) {
                                    iconSrc = '/icons/music.png';
                                } else if (window.id === 'window-ishv4ra') {
                                    iconSrc = '/icons/ishv4ra.png';
                                } else if (window.id === 'window-demos') {
                                    iconSrc = '/icons/demos.png';
                                } else if (window.id === 'window-playday') {
                                    iconSrc = '/icons/playdaycuts.png';
                                }
                                
                                return (
                                    <div
                                        key={window.id}
                                        className={`taskbarItem ${desktopState.activeWindowId === window.id ? 'active' : ''}`}
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
                                        {iconSrc && <img src={iconSrc} alt="" className="taskbarIcon" />}
                                        {window.title}
                                    </div>
                                );
                            })}
                    </div>

                    <div className="clock">
                        {currentTime}
                    </div>
                </div>

                {/* Start Menu */}
                {console.log('Rendering StartMenu with isOpen:', isStartMenuOpen)}
                <div className={`startMenu ${!isStartMenuOpen ? 'hidden' : ''}`} data-start-menu>
                    <div className="startMenuSidebar">
                        start menu
                    </div>
                    <div className="startMenuContent">
                        <div 
                            className="startMenuItem"
                            onClick={() => {
                                window.open('https://www.instagram.com/juan.zhingre/', '_blank');
                                setIsStartMenuOpen(false);
                            }}
                        >
                            <img src="/social-icons/instagram.png" alt="Instagram" className="menuItemIcon" />
                            juan.zhingre
                        </div>
                        <div 
                            className="startMenuItem"
                            onClick={() => {
                                window.open('https://www.instagram.com/ishv4ra/', '_blank');
                                setIsStartMenuOpen(false);
                            }}
                        >
                            <img src="/social-icons/instagram.png" alt="Instagram" className="menuItemIcon" />
                            ishv4ra
                        </div>
                        <div className="divider"></div>
                        <div className="startMenuItem" onClick={() => {
                            handleOpenCredits();
                            setIsStartMenuOpen(false);
                        }}>
                            Origins
                        </div>
                        <div className="divider"></div>
                        <div className="startMenuItem" onClick={() => {
                            setIsStartMenuOpen(false);
                            window.close();
                        }}>
                            <img src="/icons/startmenu.png" alt="Shutdown" className="menuItemIcon" />
                            Shut Down...
                        </div>
                    </div>
                </div>
            </>
        </div>
    );
};

export default Desktop;