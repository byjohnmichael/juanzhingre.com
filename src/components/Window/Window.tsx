import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Window as WindowType } from '../../types/desktop';
import './Window.css';

interface WindowProps {
    window: WindowType;
    onClose: (id: string) => void;
    onMinimize: (id: string) => void;
    onMaximize: (id: string) => void;
    onMove: (id: string, x: number, y: number) => void;
    onResize: (id: string, width: number, height: number) => void;
    onFocus: (id: string) => void;
    children?: React.ReactNode;
}

const Window: React.FC<WindowProps> = ({ 
    window, 
    onClose, 
    onMinimize, 
    onMaximize, 
    onMove, 
    onResize, 
    onFocus,
    children 
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    
    const windowRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);
    const isResizingRef = useRef(false);
    const dragOffsetRef = useRef({ x: 0, y: 0 });
    const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

    // Optimized mouse move handler using refs to avoid re-creation
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDraggingRef.current) {
            const newX = e.clientX - dragOffsetRef.current.x;
            const newY = e.clientY - dragOffsetRef.current.y;
            
            // Use requestAnimationFrame for smooth updates
            requestAnimationFrame(() => {
                onMove(window.id, newX, newY);
            });
        }
        
        if (isResizingRef.current) {
            const newWidth = Math.max(300, resizeStartRef.current.width + (e.clientX - resizeStartRef.current.x));
            const newHeight = Math.max(200, resizeStartRef.current.height + (e.clientY - resizeStartRef.current.y));
            
            requestAnimationFrame(() => {
                onResize(window.id, newWidth, newHeight);
            });
        }
    }, [window.id, onMove, onResize]);

    // Optimized mouse up handler
    const handleMouseUp = useCallback(() => {
        isDraggingRef.current = false;
        isResizingRef.current = false;
        setIsDragging(false);
        setIsResizing(false);
    }, []);

    // Set up event listeners only when needed
    useEffect(() => {
        if (isDragging || isResizing) {
            document.addEventListener('mousemove', handleMouseMove, { passive: true });
            document.addEventListener('mouseup', handleMouseUp, { passive: true });
            
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        onFocus(window.id);
        
        // Check if clicking on title bar or any element within it
        const titleBar = windowRef.current?.querySelector('[data-title-bar]');
        if (titleBar && windowRef.current && (e.target === titleBar || titleBar.contains(e.target as Node))) {
            const rect = windowRef.current.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const offsetY = e.clientY - rect.top;
            
            dragOffsetRef.current = { x: offsetX, y: offsetY };
            isDraggingRef.current = true;
            setIsDragging(true);
        }
    }, [onFocus, window.id]);

    const handleResizeStart = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        resizeStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            width: window.size.width,
            height: window.size.height
        };
        isResizingRef.current = true;
        setIsResizing(true);
    }, [window.size.width, window.size.height]);

    return (
        <div
            ref={windowRef}
            className={`windowContainer ${isDragging ? 'dragging' : ''} ${window.isMinimized ? 'minimized' : ''} ${window.isMaximized ? 'maximized' : ''}`}
            style={{
                left: window.position.x,
                top: window.position.y,
                width: window.size.width,
                height: window.size.height,
                zIndex: window.zIndex
            }}
            onMouseDown={handleMouseDown}
        >
            <div className="window">
                <div className="titleBar" data-title-bar>
                    <div className="titleBarText">{window.title}</div>
                    <div className="titleBarControls">
                        <button 
                            aria-label="Close"
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose(window.id);
                            }}
                            title="Close"
                            className="closeButton"
                        >
                            ×
                        </button>
                    </div>
                </div>
                
                <div className="windowBody">
                    {children}
                </div>
            </div>
            
            {!window.isMaximized && (
                <div
                    className="resizeHandle"
                    onMouseDown={handleResizeStart}
                />
            )}
        </div>
    );
};

export default Window;