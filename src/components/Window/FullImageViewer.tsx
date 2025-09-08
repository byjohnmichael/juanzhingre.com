import React, { useEffect, useState } from 'react';
import { photoData } from '../../data/photos';

interface Photo {
  id: string;
  name: string;
  path: string;
  collection: string;
}

interface FullImageViewerProps {
  photo: Photo;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

const FullImageViewer: React.FC<FullImageViewerProps> = ({ photo, onClose, onNavigate }) => {
    const photos = photoData.filter(p => p.collection === photo.collection);
    const currentIndex = photos.findIndex(p => p.id === photo.id);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < photos.length - 1;
    const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());

    // Preload adjacent images
    useEffect(() => {
        const preloadImage = (src: string) => {
            const img = new Image();
            img.onload = () => {
                setPreloadedImages(prev => {
                    const newSet = new Set(prev);
                    newSet.add(src);
                    return newSet;
                });
            };
            img.src = src;
        };

        // Preload previous image
        if (hasPrev) {
            const prevPhoto = photos[currentIndex - 1];
            if (prevPhoto && !preloadedImages.has(prevPhoto.path)) {
                preloadImage(prevPhoto.path);
            }
        }

        // Preload next image
        if (hasNext) {
            const nextPhoto = photos[currentIndex + 1];
            if (nextPhoto && !preloadedImages.has(nextPhoto.path)) {
                preloadImage(nextPhoto.path);
            }
        }
    }, [photo.id, currentIndex, hasPrev, hasNext, photos, preloadedImages]);

    return (
        <div style={{ 
            height: '100%', 
            display: 'flex',
            flexDirection: 'column',
            background: '#ffffff',
            color: '#000000'
        }}>
            {/* Header */}
            <div style={{ 
                padding: '15px 20px',
                background: '#f0f0f0',
                borderBottom: '1px solid #cccccc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={() => onNavigate('prev')}
                        disabled={!hasPrev}
                        style={{
                            padding: '8px 16px',
                            background: hasPrev ? '#4CAF50' : '#cccccc',
                            color: hasPrev ? 'white' : '#666666',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: hasPrev ? 'pointer' : 'not-allowed',
                            fontSize: '14px'
                        }}
                    >
                        ← Previous
                    </button>
                    <button 
                        onClick={() => onNavigate('next')}
                        disabled={!hasNext}
                        style={{
                            padding: '8px 16px',
                            background: hasNext ? '#4CAF50' : '#cccccc',
                            color: hasNext ? 'white' : '#666666',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: hasNext ? 'pointer' : 'not-allowed',
                            fontSize: '14px'
                        }}
                    >
                        Next →
                    </button>
                    <button 
                        onClick={onClose}
                        style={{
                            padding: '8px 16px',
                            background: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>

            {/* Image Container */}
            <div style={{ 
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                overflow: 'auto',
                background: '#ffffff'
            }}>
                <div style={{
                    position: 'relative',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <img 
                        src={photo.path}
                        alt={photo.name}
                        style={{
                            maxWidth: '400px',
                            maxHeight: '300px',
                            width: 'auto',
                            height: 'auto',
                            objectFit: 'contain',
                            boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)',
                            borderRadius: '4px'
                        }}
                        onLoad={(e) => {
                            // Log image dimensions for debugging
                            const img = e.target as HTMLImageElement;
                            console.log(`Image loaded: ${photo.name} - ${img.naturalWidth}x${img.naturalHeight}`);
                        }}
                        onError={(e) => {
                            // Fallback for failed images
                            const img = e.target as HTMLImageElement;
                            img.style.display = 'none';
                            const parent = img.parentElement;
                            if (parent) {
                                parent.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #000; font-size: 18px; text-align: center;"><div>Image Failed to Load</div><div style="font-size: 14px; margin-top: 10px; color: #666;">Check the image path: {photo.path}</div></div>';
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default FullImageViewer;
