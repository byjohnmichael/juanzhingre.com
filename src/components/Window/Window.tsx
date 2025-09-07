import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { Window as WindowType } from '../../types/desktop';

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

const WindowContainer = styled.div<{ 
  isMinimized: boolean; 
  isMaximized: boolean;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}>`
  position: absolute;
  left: ${props => props.isMinimized ? -1000 : props.x}px;
  top: ${props => props.isMinimized ? -1000 : props.y}px;
  width: ${props => props.isMaximized ? '100vw' : props.width}px;
  height: ${props => props.isMaximized ? '100vh' : props.height}px;
  z-index: ${props => props.zIndex};
  transition: ${props => props.isMinimized ? 'none' : 'all 0.2s ease'};
  
  /* Performance optimizations for smooth dragging */
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
  
  /* Smooth dragging when not transitioning */
  &.dragging {
    transition: none;
    will-change: left, top;
  }
  
  @media (max-width: 768px) {
    /* On mobile, ensure windows don't go off screen */
    left: ${props => props.isMinimized ? -1000 : Math.max(0, Math.min(props.x, window.innerWidth - props.width))}px !important;
    top: ${props => props.isMinimized ? -1000 : Math.max(0, Math.min(props.y, window.innerHeight - props.height - 50))}px !important;
    width: ${props => props.isMaximized ? '100vw' : Math.min(props.width, window.innerWidth - 20)}px;
    height: ${props => props.isMaximized ? 'calc(100vh - 50px)' : Math.min(props.height, window.innerHeight - 100)}px;
  }
`;

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
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
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
    
    if (e.target === windowRef.current?.querySelector('[data-title-bar]')) {
      const rect = windowRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
      
      dragOffsetRef.current = { x: offsetX, y: offsetY };
      setDragOffset({ x: offsetX, y: offsetY });
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
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: window.size.width,
      height: window.size.height
    });
    isResizingRef.current = true;
    setIsResizing(true);
  }, [window.size.width, window.size.height]);

  return (
    <WindowContainer
      ref={windowRef}
      isMinimized={window.isMinimized}
      isMaximized={window.isMaximized}
      zIndex={window.zIndex}
      x={window.position.x}
      y={window.position.y}
      width={window.size.width}
      height={window.size.height}
      onMouseDown={handleMouseDown}
      className={isDragging ? 'dragging' : ''}
    >
      <div className="window">
        <div className="title-bar" data-title-bar>
          <div className="title-bar-text">{window.title}</div>
          <div className="title-bar-controls">
            <button 
              aria-label="Close"
              onClick={() => onClose(window.id)}
              title="Close"
              className="close"
            />
          </div>
        </div>
        
        <div className="window-body">
          {children}
        </div>
      </div>
      
      {!window.isMaximized && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: '20px',
            height: '20px',
            cursor: 'nw-resize',
            background: 'transparent'
          }}
          onMouseDown={handleResizeStart}
        />
      )}
    </WindowContainer>
  );
};

export default Window;
