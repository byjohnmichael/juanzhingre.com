import React, { useState } from 'react';
import { photoData } from '../../data/photos';

interface Photo {
  id: string;
  name: string;
  path: string;
  collection: string;
}

interface CollectionViewerProps {
  collection: {
    id: string;
    name: string;
    path: string;
    photoCount: number;
  };
  onOpenPhoto: (photo: Photo) => void;
}

const CollectionViewer: React.FC<CollectionViewerProps> = ({ collection, onOpenPhoto }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filter photos for this collection
  const photos = photoData.filter(photo => photo.collection === collection.id);

  return (
    <div style={{ 
      height: '100%', 
      padding: '20px',
      background: '#c0c0c0',
      overflow: 'auto'
    }}>
      <div style={{ 
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '2px solid #808080'
      }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#222222', fontSize: '20px' }}>
          {collection.name}
        </h2>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center'
        }}>
          <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
            {photos.length} photos
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className={viewMode === 'grid' ? 'default' : ''}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
            <button 
              className={viewMode === 'list' ? 'default' : ''}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
        </div>
      </div>
      
      {viewMode === 'grid' ? (
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '15px',
          padding: '10px 0'
        }}>
          {photos.map(photo => (
            <div 
              key={photo.id} 
              style={{
                position: 'relative',
                borderRadius: '4px',
                overflow: 'hidden',
                cursor: 'pointer',
                background: '#ffffff',
                border: '2px solid #808080',
                boxShadow: 'inset -1px -1px #ffffff, inset 1px 1px #808080',
                transition: 'all 0.1s ease'
              }}
              onClick={() => onOpenPhoto(photo)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = 'inset -2px -2px #ffffff, inset 2px 2px #808080';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'inset -1px -1px #ffffff, inset 1px 1px #808080';
              }}
            >
              <div style={{
                width: '100%',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: '1px solid #c0c0c0',
                background: '#f8f8f8'
              }}>
                <img 
                  src={photo.path}
                  alt={photo.name}
                  style={{
                    width: '50px',
                    height: '50px',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    // Fallback for failed images
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                    const parent = img.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #999; font-size: 12px;">Image Error</div>';
                    }
                  }}
                />
              </div>
              <div style={{
                padding: '8px',
                fontSize: '11px',
                color: '#222222',
                background: '#ffffff',
                textAlign: 'center',
                fontWeight: '500',
                wordBreak: 'break-word'
              }}>
                {photo.name}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '10px 0' }}>
          {photos.map(photo => (
            <div 
              key={photo.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px',
                marginBottom: '8px',
                background: '#ffffff',
                border: '1px solid #808080',
                borderRadius: '4px',
                cursor: 'pointer',
                boxShadow: 'inset -1px -1px #ffffff, inset 1px 1px #808080',
                transition: 'all 0.1s ease'
              }}
              onClick={() => onOpenPhoto(photo)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f0f0f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '15px',
                border: '1px solid #c0c0c0',
                background: '#f8f8f8'
              }}>
                <img 
                  src={photo.path}
                  alt={photo.name}
                  style={{
                    width: '35px',
                    height: '35px',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    // Fallback for failed images
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                    const parent = img.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #999; font-size: 12px;">Error</div>';
                    }
                  }}
                />
              </div>
              <div style={{
                fontSize: '14px',
                color: '#222222',
                fontWeight: '500'
              }}>
                {photo.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionViewer;
