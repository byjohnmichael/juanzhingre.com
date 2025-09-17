import React, { useEffect, useState } from 'react';
import { photoData } from '../../data/photos';
import './FullImageViewer.css';

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
        <div className="container">
            {/* Header */}
            <div className="header">
                <div className="buttonGroup">
                    <button 
                        onClick={() => onNavigate('prev')}
                        disabled={!hasPrev}
                        className="button"
                    >
                        ← Previous
                    </button>
                    <button 
                        onClick={() => onNavigate('next')}
                        disabled={!hasNext}
                        className="button"
                    >
                        Next →
                    </button>
                    <button 
                        onClick={onClose}
                        className="button closeButton"
                    >
                        Close
                    </button>
                </div>
            </div>

            {/* Image Container */}
            <div className="imageContainer">
                <div className="imageWrapper">
                    <img 
                        src={photo.path}
                        alt={photo.name}
                        className="image"
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
                                parent.innerHTML = `
                                    <div class="errorMessage">
                                        <div>
                                            <div>Image Failed to Load</div>
                                            <div class="errorSubMessage">Check the image path: ${photo.path}</div>
                                        </div>
                                    </div>
                                `;
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default FullImageViewer;