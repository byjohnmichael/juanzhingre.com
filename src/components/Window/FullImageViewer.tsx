import React from 'react';
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

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex',
      flexDirection: 'column',
      background: '#000000',
      color: 'white'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '15px 20px',
        background: '#222222',
        borderBottom: '1px solid #444444',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ margin: '0', fontSize: '18px', fontWeight: '500' }}>
          {photo.name}
        </h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => onNavigate('prev')}
            disabled={!hasPrev}
            style={{
              padding: '8px 16px',
              background: hasPrev ? '#4CAF50' : '#666666',
              color: 'white',
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
              background: hasNext ? '#4CAF50' : '#666666',
              color: 'white',
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
        background: '#000000'
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
              maxWidth: '100%',
              maxHeight: '100%',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              boxShadow: '0 0 20px rgba(0, 0, 0, 0.8)',
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
                parent.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #fff; font-size: 18px; text-align: center;"><div>Image Failed to Load</div><div style="font-size: 14px; margin-top: 10px; color: #999;">Check the image path: {photo.path}</div></div>';
              }
            }}
          />
        </div>
      </div>

      {/* Footer Info */}
      <div style={{ 
        padding: '15px 20px',
        background: '#222222',
        borderTop: '1px solid #444444',
        textAlign: 'center'
      }}>
        <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#cccccc' }}>
          {photo.name}
        </p>
        <p style={{ margin: '0', fontSize: '12px', color: '#999999' }}>
          Photo {currentIndex + 1} of {photos.length} in collection
        </p>
      </div>
    </div>
  );
};

export default FullImageViewer;
