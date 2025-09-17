import React, { useEffect, useState, useCallback } from 'react';
import { photoCollections, photoData } from '../../data/photos';
import './PhotoGallery.css';

interface PhotoCollection {
    id: string;
    name: string;
    path: string;
    photoCount: number;
}

interface PhotoGalleryProps {
    onOpenCollection?: (collection: PhotoCollection) => void;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ onOpenCollection }) => {
    const collections: PhotoCollection[] = photoCollections;
    const [lastClickTime, setLastClickTime] = useState(0);

    // Function to get the first photo from a collection
    const getFirstPhotoFromCollection = (collectionId: string) => {
        const firstPhoto = photoData.find(photo => photo.collection === collectionId);
        return firstPhoto;
    };

    // Preload all collection cover images
    useEffect(() => {
        const preloadImage = (src: string) => {
            const img = new Image();
            img.src = src;
        };

        // Preload all collection cover images
        collections.forEach(collection => {
            const firstPhoto = getFirstPhotoFromCollection(collection.id);
            if (firstPhoto) {
                preloadImage(firstPhoto.path);
            }
        });
    }, [collections]);

    const handleCollectionClick = useCallback((collection: PhotoCollection) => {
        const now = Date.now();
        // Prevent rapid double-clicks
        if (now - lastClickTime > 300) {
            setLastClickTime(now);
            onOpenCollection?.(collection);
        }
    }, [onOpenCollection, lastClickTime]);

    return (
        <div className="container">
            <div className="galleryContainer">
                {collections.map(collection => {
                    const firstPhoto = getFirstPhotoFromCollection(collection.id);
                    
                    return (
                        <div
                            key={collection.id}
                            className="collectionItem"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleCollectionClick(collection);
                            }}
                        >
                            {firstPhoto ? (
                                <img 
                                    src={firstPhoto.path} 
                                    alt={firstPhoto.name}
                                    className="imagePreview"
                                />
                            ) : (
                                <div className="folderIcon">
                                    📁
                                </div>
                            )}
                            <div className="collectionInfo">
                                <div className="collectionName">
                                    {collection.name}
                                </div>
                                <div className="photoCount">
                                    {collection.photoCount} photos
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PhotoGallery;