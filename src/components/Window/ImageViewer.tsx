import React, { useState } from 'react';
import { photoData } from '../../data/photos';
import './ImageViewer.css';

interface Photo {
    id: string;
    name: string;
    path: string;
    collection: string;
}

interface ImageViewerProps {
    collection: {
        id: string;
        name: string;
        path: string;
        photoCount: number;
    };
    onOpenPhoto: (photo: Photo) => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ collection, onOpenPhoto }) => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    
    // Filter photos for this collection
    const photos = photoData.filter(photo => photo.collection === collection.id);

    return (
        <div className="container">
            <div className="header">
                <h2 className="title">
                    {collection.name}
                </h2>
                <div className="headerInfo">
                    <p className="photoCount">
                        {photos.length} photos
                    </p>
                    <div className="viewModeButtons">
                        <button 
                            className="viewMode === 'grid' ? default : ''"
                            onClick={() => setViewMode('grid')}
                        >
                            Grid
                        </button>
                        <button 
                            className="viewMode === 'list' ? default : ''"
                            onClick={() => setViewMode('list')}
                        >
                            List
                        </button>
                    </div>
                </div>
            </div>
            
            {viewMode === 'grid' ? (
                <div className="gridContainer">
                    {photos.map(photo => (
                        <div 
                            key={photo.id} 
                            className="gridItem"
                            onClick={() => onOpenPhoto(photo)}
                        >
                            <div className="imagePreview">
                                <img 
                                    src={photo.path}
                                    alt={photo.name}
                                    onError={(e) => {
                                        // Fallback for failed images
                                        const img = e.target as HTMLImageElement;
                                        img.style.display = 'none';
                                        const parent = img.parentElement;
                                        if (parent) {
                                            parent.innerHTML = `<div class="imageError">Image Error</div>`;
                                        }
                                    }}
                                />
                            </div>
                            <div className="imageLabel">
                                {photo.name}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="listContainer">
                    {photos.map(photo => (
                        <div 
                            key={photo.id}
                            className="listItem"
                            onClick={() => onOpenPhoto(photo)}
                        >
                            <div className="listImagePreview">
                                <img 
                                    src={photo.path}
                                    alt={photo.name}
                                    onError={(e) => {
                                        // Fallback for failed images
                                        const img = e.target as HTMLImageElement;
                                        img.style.display = 'none';
                                        const parent = img.parentElement;
                                        if (parent) {
                                            parent.innerHTML = `<div class="listImageError">Error</div>`;
                                        }
                                    }}
                                />
                            </div>
                            <div className="listImageLabel">
                                {photo.name}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageViewer;