import React, { useState, useEffect, useCallback } from 'react';
import './SimpleGame.css';

const SimpleGame: React.FC = () => {
    const [playerPos, setPlayerPos] = useState({ x: 150, y: 100 });
    const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
    const [score, setScore] = useState(0);
    const [gameActive, setGameActive] = useState(true);

    const movePlayer = useCallback((dx: number, dy: number) => {
        setPlayerPos(prev => ({
            x: Math.max(10, Math.min(270, prev.x + dx)),
            y: Math.max(10, Math.min(170, prev.y + dy))
        }));
    }, []);

    const checkCollision = useCallback(() => {
        const distance = Math.sqrt(
            Math.pow(playerPos.x - targetPos.x, 2) + 
            Math.pow(playerPos.y - targetPos.y, 2)
        );
        
        if (distance < 20) {
            setScore(prev => prev + 10);
            setTargetPos({
                x: Math.random() * 250 + 10,
                y: Math.random() * 170 + 10
            });
        }
    }, [playerPos, targetPos]);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!gameActive) return;
            
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                    movePlayer(0, -10);
                    break;
                case 'ArrowDown':
                case 's':
                    movePlayer(0, 10);
                    break;
                case 'ArrowLeft':
                case 'a':
                    movePlayer(-10, 0);
                    break;
                case 'ArrowRight':
                case 'd':
                    movePlayer(10, 0);
                    break;
                default:
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [movePlayer, gameActive]);

    useEffect(() => {
        if (gameActive) {
            checkCollision();
        }
    }, [playerPos, checkCollision, gameActive]);

    const resetGame = () => {
        setScore(0);
        setPlayerPos({ x: 150, y: 100 });
        setTargetPos({ x: 50, y: 50 });
        setGameActive(true);
    };

    return (
        <div className="gameContainer">
            <h2 className="gameTitle">Icon Collector</h2>
            <div className="score">Score: {score}</div>
            <div className="gameCanvas">
                <div 
                    className="player"
                    style={{
                        left: playerPos.x,
                        top: playerPos.y
                    }}
                />
                <div 
                    className="target"
                    style={{
                        left: targetPos.x,
                        top: targetPos.y
                    }}
                />
            </div>
            <div className="instructions">
                Use WASD or Arrow Keys to move the green circle<br />
                Collect the red targets to score points!
            </div>
            <button 
                onClick={resetGame}
                className="resetButton"
            >
                Reset Game
            </button>
        </div>
    );
};

export default SimpleGame;