import React, { useState, useRef } from 'react';
import './DemoPlayer.css';

interface DemoFile {
    name: string;
    filename: string;
    duration: string;
    size: string;
}

const DemoPlayer: React.FC = () => {
    const [currentTrack, setCurrentTrack] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [sortBy, setSortBy] = useState<'name' | 'duration'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    
    const audioRef = useRef<HTMLAudioElement>(null);

    const demos: DemoFile[] = [
        { name: "You are driving me insane", filename: "you-are-driving-me-insane.m4a", duration: "3:45", size: "1.8MB" },
        { name: "Girl you lol fine bridge", filename: "girl-you-lol-fine-bridge.m4a", duration: "1:20", size: "459KB" },
        { name: "Hideaway updated demo", filename: "hideaway-updated-demo.m4a", duration: "2:45", size: "1.0MB" },
        { name: "Sunburnt shrederino", filename: "sunburnt-shrederino.m4a", duration: "2:30", size: "1.2MB" },
        { name: "Ya seeeeee (demo)", filename: "ya-seeeeee(demo).m4a", duration: "2:55", size: "1.1MB" },
        { name: "Hmmm (demo)", filename: "hmmm(demo).m4a", duration: "1:50", size: "636KB" },
        { name: "Song idea", filename: "song-idea.m4a", duration: "2:15", size: "1.2MB" }
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
        <div className="playerContainer">
            <div className="tableContainer">
                <table className="table">
                    <thead className="tableHeader">
                        <tr className="headerRow">
                            <th 
                                className={`headerCell sortable`}
                                onClick={() => handleSort('name')}
                                style={{ width: '50%' }}
                            >
                                Song Name
                                {sortBy === 'name' && (
                                    <span className="sortIcon">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                                )}
                            </th>
                            <th 
                                className={`headerCell sortable`}
                                onClick={() => handleSort('duration')}
                                style={{ width: '15%' }}
                            >
                                Time
                                {sortBy === 'duration' && (
                                    <span className="sortIcon">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                                )}
                            </th>
                            <th className="headerCell" style={{ width: '20%' }}>Artist</th>
                            <th className="headerCell" style={{ width: '15%' }}>Album</th>
                        </tr>
                    </thead>
                    <tbody className="tableBody">
                        {sortedDemos.map((demo) => (
                            <tr 
                                key={demo.filename}
                                className={`tableRow ${currentTrack === demo.filename ? 'playing' : ''}`}
                                onClick={() => handlePlayTrack(demo.filename)}
                            >
                                <td className="tableCell">
                                    <div className="playButtonContainer">
                                        <button 
                                            className={`playButton ${currentTrack === demo.filename && isPlaying ? 'playing' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePlayTrack(demo.filename);
                                            }}
                                        >
                                            {currentTrack === demo.filename && isPlaying ? '⏸' : '▶'}
                                        </button>
                                        {demo.name}
                                    </div>
                                </td>
                                <td className="tableCell">{demo.duration}</td>
                                <td className="tableCell">Juan Zhingre</td>
                                <td className="tableCell">demos</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <audio
                ref={audioRef}
                onEnded={() => {
                    setIsPlaying(false);
                }}
            />
        </div>
    );
};

export default DemoPlayer;