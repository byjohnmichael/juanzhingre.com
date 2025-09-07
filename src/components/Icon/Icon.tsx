import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { Icon as IconType } from '../../types/desktop';

interface IconProps {
  icon: IconType;
  onClick: () => void;
  onMove: (id: string, x: number, y: number) => void;
  isSelected?: boolean;
}

const IconContainer = styled.div<{ isSelected: boolean; x: number; y: number; isDragging: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: ${props => props.isDragging ? 'grabbing' : 'grab'};
  user-select: none;
  padding: 8px;
  border-radius: 8px;
  transition: ${props => props.isDragging ? 'none' : 'all 0.2s ease'};
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  
  /* Performance optimizations for smooth dragging */
  will-change: ${props => props.isDragging ? 'left, top' : 'transform'};
  transform: ${props => props.isDragging ? 'translateZ(0)' : 'scale(1)'};
  backface-visibility: hidden;
  
  @media (max-width: 768px) {
    padding: 8px;
    min-height: 80px;
    min-width: 80px;
    touch-action: none;
    flex-shrink: 0;
  }
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: ${props => props.isDragging ? 'translateZ(0)' : 'scale(1.05)'};
  }
  
  ${props => props.isSelected && !props.isDragging && `
    background-color: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  `}
  
  ${props => props.isDragging && `
    background-color: rgba(255, 255, 255, 0.15);
    transform: scale(1.1) translateZ(0);
    z-index: 9999;
  `}
`;

const IconCircle = styled.div<{ color: string; isImage: boolean }>`
  width: 64px;
  height: 64px;
  border-radius: ${props => props.isImage ? '0' : '50%'};
  background-color: ${props => props.isImage ? 'transparent' : props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  box-shadow: ${props => props.isImage ? 'none' : '0 4px 8px rgba(0, 0, 0, 0.2)'};
  font-size: ${props => props.isImage ? '0' : '32px'};
  color: white;
  font-weight: bold;
  overflow: hidden;
  
  @media (max-width: 768px) {
    width: 72px;
    height: 72px;
    font-size: ${props => props.isImage ? '0' : '36px'};
  }
`;

const IconLabel = styled.div`
  color: white;
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  max-width: 80px;
  word-wrap: break-word;
  
  @media (max-width: 768px) {
    font-size: 14px;
    max-width: 100px;
    line-height: 1.2;
  }
`;

const Icon: React.FC<IconProps> = ({ icon, onClick, onMove, isSelected = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragDistance, setDragDistance] = useState(0);
  const [touchUsed, setTouchUsed] = useState(false);
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
    setDragOffset({ x: offsetX, y: offsetY });
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
    setTouchUsed(true);
    const touch = e.touches[0];
    const rect = iconRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const offsetX = touch.clientX - rect.left;
    const offsetY = touch.clientY - rect.top;
    
    // Store start position for drag distance calculation
    startPosRef.current = { x: touch.clientX, y: touch.clientY };
    
    dragOffsetRef.current = { x: offsetX, y: offsetY };
    setDragOffset({ x: offsetX, y: offsetY });
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
    setTimeout(() => setTouchUsed(false), 100);
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
    setTimeout(() => setTouchUsed(false), 100);
  }, [onClick, dragDistance, lastClickTime]);

  return (
    <IconContainer 
      ref={iconRef}
      x={icon.position.x}
      y={icon.position.y}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      isSelected={isSelected}
      isDragging={isDragging}
    >
      <IconCircle color={icon.color} isImage={isImageIcon}>
        {isImageIcon ? (
          <img 
            src={icon.icon} 
            alt={icon.name}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            draggable={false}
          />
        ) : (
          icon.icon
        )}
      </IconCircle>
      <IconLabel>{icon.name}</IconLabel>
    </IconContainer>
  );
};

export default Icon;
