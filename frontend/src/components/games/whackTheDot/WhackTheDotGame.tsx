import React, { useEffect, useRef, useState } from 'react';
import './WhackTheDotGame.css';
import TopThreeScores from '../topThreeScores/TopThreeScores';
import { useAppSelector } from '../../../redux/hooks';
import useUserId from '../../../hooks/useUserId';
import useService from '../../../hooks/useService';
import GameService from "../../../services/auth-aware/Games"

type Dot = {
  id: number;
  x: number;
  y: number;
};

const GAME_DURATION = 30; // seconds
const DOT_LIFETIME = 1500; // ms

const WhackTheDotGame: React.FC = () => {
  const [score, setScore] = useState(0);
  const [dots, setDots] = useState<Dot[]>([]);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const dotIdCounter = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
      return () => clearInterval(timer);
    }

    if (timeLeft === 0) stopGame();
  }, [isPlaying, timeLeft]);

  const spawnDot = () => {
    const area = gameAreaRef.current;
    if (!area) return;

    const width = area.clientWidth;
    const height = area.clientHeight;
    const size = 40;

    const x = Math.random() * (width - size);
    const y = Math.random() * (height - size);

    const id = dotIdCounter.current++;
    const newDot: Dot = { id, x, y };

    setDots(prev => [...prev, newDot]);

    setTimeout(() => {
      setDots(prev => prev.filter(dot => dot.id !== id));
    }, DOT_LIFETIME);
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setIsPlaying(true);
    setDots([]);

    intervalRef.current = setInterval(spawnDot, 500);
  };

  const stopGame = () => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleDotClick = (id: number) => {
    setDots(prev => prev.filter(dot => dot.id !== id));
    setScore(s => s + 1);
  };

  const enterFullscreen = async () => {
    if (gameAreaRef.current) {
      try {
        await gameAreaRef.current.requestFullscreen?.();
        setIsFullscreen(true);
      } catch (err) {
        console.error('Error entering fullscreen:', err);
      }
    }
  };

  const exitFullscreen = async () => {
    try {
      await document.exitFullscreen?.();
      setIsFullscreen(false);
    } catch (err) {
      console.error('Error exiting fullscreen:', err);
    }
  };


  const scores = useAppSelector(state => state.games.scores)
  const userId = useUserId()
  const gamesService = useService(GameService)

  useEffect(() => {
    if (!isPlaying) {
      const maybeUpdateScore = async () => {
        const myScore = scores.find(score => score.userId === userId)
        const myBestScore = myScore?.bestScore ?? 0

        if (score > myBestScore) {
          try {
            await gamesService.newGameBestScore("WhackTheDot", score)
            alert(`new best score!!`)
          } catch (e) {
            alert(e)
          }
        }
      }

      maybeUpdateScore()
    }
  }, [isPlaying])

  return (
    <>
      <div className="whackTheDot-container">
        <h1 className="whackTheDot-title">WhackTheDot Game</h1>

        <div className="whackTheDot-controls">
          {!isFullscreen ? (
            <button onClick={enterFullscreen} className="whackTheDot-fullscreenButton">
              Enter Fullscreen
            </button>
          ) : (
            <button onClick={exitFullscreen} className="whackTheDot-exitFullscreenButton">
              Exit Fullscreen
            </button>
          )}
        </div>

        <div className="whackTheDot-gameArea" ref={gameAreaRef}>
          <div className="whackTheDot-stats">
            <span>Score: {score}</span>
            <span>Time: {timeLeft}s</span>
          </div>

          {isPlaying ? (
            dots.map(dot => (
              <div
                key={dot.id}
                className="whackTheDot-dot"
                style={{ top: dot.y, left: dot.x }}
                onClick={() => handleDotClick(dot.id)}
              />
            ))
          ) : (
            <button className="whackTheDot-startButton" onClick={startGame}>
              Start Game
            </button>
          )}
        </div>
      </div>
      <h1>My followers best scores</h1>
      <TopThreeScores
        scores={scores}
      />
    </>
  );
};

export default WhackTheDotGame;
