import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Icon as IconType } from '../../types/desktop';
import './Icon.css';

interface IconProps {
    icon: IconType;
    onClick: () => void;
    onMove: (id: string, x: number, y: number) => void;
    isSelected?: boolean;
}

const Icon: React.FC<IconProps> = ({ icon, onClick, onMove, isSelected = false }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragDistance, setDragDistance] = useState(0);
    const [lastClickTime, setLastClickTime] = useState(0);
    
    const iconRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);
    const dragOffsetRef = useRef({ x: 0, y: 0 });
    const startPosRef = useRef({ x: 0, y: 0 });
    const clickHandledRef = useRef(false);

    const isImageIcon = icon.icon.includes('.png') || icon.icon.includes('.jpg') || icon.icon.includes('.jpeg') || icon.icon.includes('.gif');

    // Optimized mouse move handler using refs
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDraggingRef.current) {
            const newX = e.clientX - dragOffsetRef.current.x;
            const newY = e.clientY - dragOffsetRef.current.y;
            
            // Calculate drag distance to determine if it's a drag or click
            const distance = Math.sqrt(
                Math.pow(e.clientX - startPosRef.current.x, 2) + 
                Math.pow(e.clientY - startPosRef.current.y, 2)
            );
            setDragDistance(distance);
            
            // Use requestAnimationFrame for smooth updates
            requestAnimationFrame(() => {
                onMove(icon.id, newX, newY);
            });
        }
    }, [icon.id, onMove]);

    // Optimized mouse up handler
    const handleMouseUp = useCallback(() => {
        isDraggingRef.current = false;
        setIsDragging(false);
    }, []);

    // Set up event listeners only when dragging
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove, { passive: true });
            document.addEventListener('mouseup', handleMouseUp, { passive: true });
            
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        // Only start dragging on left mouse button
        if (e.button !== 0) return;
        
        const rect = iconRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        
        // Store start position for drag distance calculation
        startPosRef.current = { x: e.clientX, y: e.clientY };
        
        dragOffsetRef.current = { x: offsetX, y: offsetY };
        setDragDistance(0);
        isDraggingRef.current = true;
        setIsDragging(true);
        
        // Prevent text selection during drag
        e.preventDefault();
    }, []);

    const handleClick = useCallback((e: React.MouseEvent) => {
        // Only handle mouse clicks on desktop
        if (window.innerWidth <= 768) {
            return;
        }
        
        const now = Date.now();
        // Only trigger click if we didn't drag (drag distance < 5px) and it's not a rapid double-click
        if (dragDistance < 5 && (now - lastClickTime) > 300 && !clickHandledRef.current) {
            clickHandledRef.current = true;
            setLastClickTime(now);
            onClick();
            
            // Reset the click handled flag after a short delay
            setTimeout(() => {
                clickHandledRef.current = false;
            }, 500);
        }
    }, [onClick, dragDistance, lastClickTime]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        const rect = iconRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const offsetX = touch.clientX - rect.left;
        const offsetY = touch.clientY - rect.top;
        
        // Store start position for drag distance calculation
        startPosRef.current = { x: touch.clientX, y: touch.clientY };
        
        dragOffsetRef.current = { x: offsetX, y: offsetY };
        setDragDistance(0);
        isDraggingRef.current = true;
        setIsDragging(true);
        
        // Prevent default touch behavior
        e.preventDefault();
    }, []);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (isDraggingRef.current) {
            const touch = e.touches[0];
            const newX = touch.clientX - dragOffsetRef.current.x;
            const newY = touch.clientY - dragOffsetRef.current.y;
            
            // Calculate drag distance to determine if it's a drag or tap
            const distance = Math.sqrt(
                Math.pow(touch.clientX - startPosRef.current.x, 2) + 
                Math.pow(touch.clientY - startPosRef.current.y, 2)
            );
            setDragDistance(distance);
            
            // Use requestAnimationFrame for smooth updates
            requestAnimationFrame(() => {
                onMove(icon.id, newX, newY);
            });
        }
    }, [icon.id, onMove]);


    // Document touch end handler for dragging
    const handleDocumentTouchEnd = useCallback((e: TouchEvent) => {
        isDraggingRef.current = false;
        setIsDragging(false);
        // Reset touchUsed after a short delay to allow for proper click handling
        setTimeout(() => {}, 100);
    }, []);

    // Set up touch event listeners
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('touchmove', handleTouchMove, { passive: false });
            document.addEventListener('touchend', handleDocumentTouchEnd, { passive: true });
            
            return () => {
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleDocumentTouchEnd);
            };
        }
    }, [isDragging, handleTouchMove, handleDocumentTouchEnd]);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        const now = Date.now();
        // Only trigger click if we didn't drag (drag distance < 10px for touch) and it's not a rapid double-click
        if (dragDistance < 10 && (now - lastClickTime) > 300 && !clickHandledRef.current) {
            clickHandledRef.current = true;
            setLastClickTime(now);
            onClick();
            
            // Reset the click handled flag after a short delay
            setTimeout(() => {
                clickHandledRef.current = false;
            }, 500);
        }
        
        isDraggingRef.current = false;
        setIsDragging(false);
        // Reset touchUsed after a short delay to allow for proper click handling
        setTimeout(() => {}, 100);
    }, [onClick, dragDistance, lastClickTime]);

    return (
        <div 
            ref={iconRef}
            className={`iconContainer ${isDragging ? 'dragging' : ''} ${isSelected ? 'selected' : ''}`}
            style={{
                left: icon.position.x,
                top: icon.position.y
            }}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <div 
                className={`iconCircle ${isImageIcon ? 'image' : ''}`}
                style={{ backgroundColor: isImageIcon ? 'transparent' : icon.color }}
            >
                {isImageIcon ? (
                    <img 
                        src={icon.icon} 
                        alt={icon.name}
                        className="iconImage"
                        draggable={false}
                    />
                ) : (
                    icon.icon
                )}
            </div>
            <div className="iconLabel">{icon.name}</div>
        </div>
    );
};

export default Icon;