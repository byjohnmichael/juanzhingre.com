import React from 'react';

interface FolderContentProps {
  folderId: string;
  folderName: string;
}

const FolderContent: React.FC<FolderContentProps> = ({ folderId, folderName }) => {
  const getFolderContent = () => {
    switch (folderId) {
      case 'music':
        return {
          icon: '🎵',
          title: 'Music Collection',
          description: 'Your personal music library and playlists. Click to browse your favorite tracks and discover new music.'
        };
      
      case 'the-archive':
        return {
          icon: '📚',
          title: 'ishv4ra',
          description: 'A curated collection of memories, documents, and important files. Your digital time capsule.'
        };
      
      case 'sculpter':
        return {
          icon: '🎨',
          title: 'Sculpter',
          description: 'Your creative workspace for digital art, designs, and artistic projects. Let your imagination flow.'
        };
      
      case 'about':
        return {
          icon: 'ℹ️',
          title: 'About',
          description: 'Learn more about this desktop, its features, and how to customize it to your needs.'
        };
      
      default:
        return {
          icon: '📁',
          title: folderName,
          description: 'This folder contains various files and documents.'
        };
    }
  };

  const content = getFolderContent();

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>{content.icon}</div>
      <h2 style={{ margin: '0 0 15px 0', color: '#222222', fontSize: '24px', fontWeight: 'bold' }}>
        {content.title}
      </h2>
      <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '16px', maxWidth: '400px', lineHeight: '1.5' }}>
        {content.description}
      </p>
      
      <div className="field-row" style={{ justifyContent: 'center', marginTop: '30px' }}>
        <button className="default">
          Open Folder
        </button>
        <button>
          Properties
        </button>
      </div>
    </div>
  );
};

export default FolderContent;
