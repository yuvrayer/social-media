import React, { useEffect, useRef, useState } from 'react';
import './ButtonClickGame.css';
import { useAppSelector } from '../../../redux/hooks';
import useUserId from '../../../hooks/useUserId';
import useService from '../../../hooks/useService';
import GameService from "../../../services/auth-aware/Games"
import TopThreeScores from '../topThreeScores/TopThreeScores';

const GAME_DURATION = 30;

const ButtonClickGame: React.FC = () => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: '50%', left: '50%' });

  const gameAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsPlaying(false);
      exitFullscreen();
    }
  }, [timeLeft]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setIsPlaying(true);
    moveButton();
  };

  const handleClick = () => {
    if (!isPlaying) return;
    setScore((prev) => prev + 1);
    moveButton();
  };

  const moveButton = () => {
    const gameArea = gameAreaRef.current;
    if (!gameArea) return;

    const areaWidth = gameArea.offsetWidth;
    const areaHeight = gameArea.offsetHeight;
    const buttonSize = 80;

    const left = Math.random() * (areaWidth - buttonSize);
    const top = Math.random() * (areaHeight - buttonSize);

    setButtonPosition({ top: `${top}px`, left: `${left}px` });
  };

  const enterFullscreen = () => {
    const elem = gameAreaRef.current;
    if (elem && !document.fullscreenElement) {
      elem.requestFullscreen().catch((err) => {
        console.error('Failed to enter fullscreen:', err);
      });
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        console.error('Failed to exit fullscreen:', err);
      });
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
            await gamesService.newGameBestScore("ButtonClick", score)
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
      <div className="buttonClick-container">
        <h1 className="buttonClick-title">ButtonClick Game</h1>

        {/* Fullscreen Toggle Buttons */}
        <div className="buttonClick-controls">
          {!isFullscreen && (
            <button className="buttonClick-fullscreenButton" onClick={enterFullscreen}>
              Enter Fullscreen
            </button>
          )}
          {isFullscreen && (
            <button className="buttonClick-exitFullscreenButton" onClick={exitFullscreen}>
              Exit Fullscreen
            </button>
          )}
        </div>

        {/* Game Area (can go fullscreen) */}
        <div className="buttonClick-gameArea" ref={gameAreaRef}>
          {/* Score & Time shown inside fullscreen */}
          <div className="buttonClick-info">
            <span className="buttonClick-score">Score: {score}</span>
            <span className="buttonClick-timer">Time: {timeLeft}s</span>
          </div>

          {isPlaying && (
            <button
              className="buttonClick-button"
              onClick={handleClick}
              style={{
                position: 'absolute',
                top: buttonPosition.top,
                left: buttonPosition.left,
              }}
            >
              Click Me!
            </button>
          )}

          {!isPlaying && (
            <button className="buttonClick-startButton" onClick={startGame}>
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

export default ButtonClickGame;
