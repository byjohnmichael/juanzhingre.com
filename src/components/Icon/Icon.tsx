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
`;

const IconLabel = styled.div`
  color: white;
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  max-width: 80px;
  word-wrap: break-word;
`;

const Icon: React.FC<IconProps> = ({ icon, onClick, onMove, isSelected = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragDistance, setDragDistance] = useState(0);
  
  const iconRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef({ x: 0, y: 0 });

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
    // Only trigger click if we didn't drag (drag distance < 5px)
    if (dragDistance < 5) {
      onClick();
    }
  }, [onClick, dragDistance]);

  return (
    <IconContainer 
      ref={iconRef}
      x={icon.position.x}
      y={icon.position.y}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
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
