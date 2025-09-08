import React, { useEffect, useState, useCallback } from 'react';
import { photoCollections, photoData } from '../../data/photos';

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
        <div style={{ 
            height: '100%', 
            padding: '20px',
            background: '#c0c0c0',
            overflow: 'auto'
        }}>
            <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                padding: '10px 0'
            }}>
                {collections.map(collection => {
                    const firstPhoto = getFirstPhotoFromCollection(collection.id);
                    
                    return (
                        <div
                            key={collection.id}
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                cursor: 'pointer',
                                padding: '15px',
                                background: '#ffffff',
                                border: '2px solid #808080',
                                borderRadius: '4px',
                                boxShadow: 'inset -1px -1px #ffffff, inset 1px 1px #808080',
                                transition: 'all 0.1s ease',
                                minHeight: '80px'
                            }}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleCollectionClick(collection);
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f0f0f0';
                                e.currentTarget.style.transform = 'scale(1.02)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#ffffff';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            {firstPhoto ? (
                                <img 
                                    src={firstPhoto.path} 
                                    alt={firstPhoto.name}
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        objectFit: 'cover',
                                        marginRight: '15px',
                                        border: '1px solid #ccc'
                                    }}
                                />
                            ) : (
                                <div style={{ 
                                    fontSize: '36px', 
                                    marginRight: '15px',
                                    color: '#000080'
                                }}>
                                    📁
                                </div>
                            )}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start'
                            }}>
                                <div style={{
                                    fontSize: '14px',
                                    color: '#222222',
                                    fontWeight: '500',
                                    lineHeight: '1.2',
                                    marginBottom: '5px'
                                }}>
                                    {collection.name}
                                </div>
                                <div style={{
                                    fontSize: '12px',
                                    color: '#666'
                                }}>
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
