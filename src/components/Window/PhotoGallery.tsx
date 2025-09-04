import React from 'react';
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

  // Function to get the first photo from a collection
  const getFirstPhotoFromCollection = (collectionId: string) => {
    const firstPhoto = photoData.find(photo => photo.collection === collectionId);
    return firstPhoto;
  };

  return (
    <div style={{ 
      height: '100%', 
      padding: '20px',
      background: '#c0c0c0',
      overflow: 'auto'
    }}>
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        padding: '10px 0'
      }}>
        {collections.map(collection => {
          const firstPhoto = getFirstPhotoFromCollection(collection.id);
          
          return (
            <div
              key={collection.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '15px',
                background: '#ffffff',
                border: '2px solid #808080',
                borderRadius: '4px',
                boxShadow: 'inset -1px -1px #ffffff, inset 1px 1px #808080',
                transition: 'all 0.1s ease',
                minHeight: '100px'
              }}
              onClick={() => onOpenCollection?.(collection)}
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
                    width: '80px',
                    height: '80px',
                    objectFit: 'cover',
                    marginBottom: '10px',
                    border: '1px solid #ccc'
                  }}
                />
              ) : (
                <div style={{ 
                  fontSize: '48px', 
                  marginBottom: '10px',
                  color: '#000080'
                }}>
                  📁
                </div>
              )}
              <div style={{
                fontSize: '12px',
                color: '#222222',
                textAlign: 'center',
                fontWeight: '500',
                lineHeight: '1.2',
                wordBreak: 'break-word'
              }}>
                {collection.name}
              </div>
              <div style={{
                fontSize: '10px',
                color: '#666',
                marginTop: '5px'
              }}>
                {collection.photoCount} photos
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PhotoGallery;
