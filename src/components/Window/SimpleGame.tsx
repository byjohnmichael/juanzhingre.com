import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const GameTitle = styled.h2`
  margin: 0 0 20px 0;
  font-size: 24px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const GameCanvas = styled.div`
  width: 300px;
  height: 200px;
  border: 3px solid white;
  border-radius: 10px;
  background: #000;
  position: relative;
  overflow: hidden;
  margin-bottom: 20px;
`;

const Player = styled.div<{ x: number; y: number }>`
  width: 20px;
  height: 20px;
  background: #00ff00;
  border-radius: 50%;
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  transition: all 0.1s ease;
  box-shadow: 0 0 10px #00ff00;
`;

const Target = styled.div<{ x: number; y: number }>`
  width: 15px;
  height: 15px;
  background: #ff0000;
  border-radius: 50%;
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  box-shadow: 0 0 10px #ff0000;
`;

const Score = styled.div`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const Instructions = styled.div`
  text-align: center;
  font-size: 14px;
  opacity: 0.8;
`;

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
    <GameContainer>
      <GameTitle>Icon Collector</GameTitle>
      <Score>Score: {score}</Score>
      <GameCanvas>
        <Player x={playerPos.x} y={playerPos.y} />
        <Target x={targetPos.x} y={targetPos.y} />
      </GameCanvas>
      <Instructions>
        Use WASD or Arrow Keys to move the green circle<br />
        Collect the red targets to score points!
      </Instructions>
      <button 
        onClick={resetGame}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Reset Game
      </button>
    </GameContainer>
  );
};

export default SimpleGame;
