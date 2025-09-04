import React, { useState, useRef } from 'react';
import styled from 'styled-components';

const PlayerContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border: 2px solid black;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const TableContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  border-bottom: 1px solid #ccc;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
`;

const TableHeader = styled.thead`
  background-color: #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 1;
`;

const HeaderRow = styled.tr`
  border-bottom: 1px solid #ccc;
`;

const HeaderCell = styled.th<{ sortable?: boolean }>`
  padding: 8px 12px;
  text-align: left;
  font-weight: bold;
  color: #333;
  border-right: 1px solid #ccc;
  cursor: ${props => props.sortable ? 'pointer' : 'default'};
  user-select: none;
  
  &:hover {
    background-color: ${props => props.sortable ? '#e0e0e0' : 'transparent'};
  }
  
  &:last-child {
    border-right: none;
  }
`;

const SortIcon = styled.span`
  margin-left: 4px;
  font-size: 10px;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr<{ isPlaying: boolean }>`
  background-color: ${props => props.isPlaying ? '#e3f2fd' : 'white'};
  border-bottom: 1px solid #eee;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.isPlaying ? '#e3f2fd' : '#f8f8f8'};
  }
`;

const TableCell = styled.td`
  padding: 6px 12px;
  border-right: 1px solid #eee;
  vertical-align: middle;
  
  &:last-child {
    border-right: none;
  }
`;


const PlayButton = styled.button<{ isPlaying: boolean }>`
  background: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 0;
  cursor: pointer;
  width: 20px;
  height: 20px;
  font-size: 10px;
  color: ${props => props.isPlaying ? '#1976d2' : '#666'};
  margin-right: 8px;
  box-shadow: 1px 1px 2px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  &:hover {
    background: #e0e0e0;
    color: #1976d2;
  }
  
  &:active {
    box-shadow: inset 1px 1px 2px rgba(0,0,0,0.1);
  }
`;



interface DemoFile {
  name: string;
  filename: string;
  duration: string;
  size: string;
}

const DemosPlayer: React.FC = () => {
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'duration'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const demos: DemoFile[] = [
    { name: "You are driving me insane", filename: "You are driving me insane.m4a", duration: "3:45", size: "1.8MB" },
    { name: "Sunburnt shrederino", filename: "Sunburnt shrederino.m4a", duration: "2:30", size: "1.2MB" },
    { name: "Song idea", filename: "Song idea.m4a", duration: "2:15", size: "1.2MB" },
    { name: "Girl you lol fine bridge", filename: "Girl you lol fine bridge_.m4a", duration: "1:20", size: "459KB" },
    { name: "Hideaway updated demo", filename: "Hideaway updated demo.m4a", duration: "2:45", size: "1.0MB" },
    { name: "Hmmm (demo)", filename: "Hmmm (demo).m4a", duration: "1:50", size: "636KB" },
    { name: "Ya seeeeee (demo)", filename: "Ya seeeeee (demo).m4a", duration: "2:55", size: "1.1MB" }
  ];

  const sortedDemos = [...demos].sort((a, b) => {
    const aValue = sortBy === 'name' ? a.name.toLowerCase() : a.duration;
    const bValue = sortBy === 'name' ? b.name.toLowerCase() : b.duration;
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const handleSort = (column: 'name' | 'duration') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };


  const handlePlayTrack = (filename: string) => {
    if (currentTrack === filename && isPlaying) {
      // Pause current track
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      // Play new track
      setCurrentTrack(filename);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = `/demos/${filename}`;
        audioRef.current.play();
      }
    }
  };



  return (
    <PlayerContainer>
      <TableContainer>
        <Table>
          <TableHeader>
            <HeaderRow>
              <HeaderCell 
                sortable 
                onClick={() => handleSort('name')}
                style={{ width: '50%' }}
              >
                Song Name
                {sortBy === 'name' && (
                  <SortIcon>{sortOrder === 'asc' ? '▲' : '▼'}</SortIcon>
                )}
              </HeaderCell>
              <HeaderCell 
                sortable 
                onClick={() => handleSort('duration')}
                style={{ width: '15%' }}
              >
                Time
                {sortBy === 'duration' && (
                  <SortIcon>{sortOrder === 'asc' ? '▲' : '▼'}</SortIcon>
                )}
              </HeaderCell>
              <HeaderCell style={{ width: '20%' }}>Artist</HeaderCell>
              <HeaderCell style={{ width: '15%' }}>Album</HeaderCell>
            </HeaderRow>
          </TableHeader>
          <TableBody>
            {sortedDemos.map((demo) => (
              <TableRow 
                key={demo.filename}
                isPlaying={currentTrack === demo.filename}
                onClick={() => handlePlayTrack(demo.filename)}
              >
                <TableCell>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <PlayButton 
                      isPlaying={currentTrack === demo.filename && isPlaying}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayTrack(demo.filename);
                      }}
                    >
                      {currentTrack === demo.filename && isPlaying ? '⏸' : '▶'}
                    </PlayButton>
                    {demo.name}
                  </div>
                </TableCell>
                <TableCell>{demo.duration}</TableCell>
                <TableCell>Juan Zhingre</TableCell>
                <TableCell>demos</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      
      <audio
        ref={audioRef}
        onEnded={() => {
          setIsPlaying(false);
        }}
      />
    </PlayerContainer>
  );
};

export default DemosPlayer;
