import React, { useState, useRef, useEffect } from 'react';
import './ReactionTimeGame.css';
import TopThreeScores from '../topThreeScores/TopThreeScores';
import { useAppSelector } from '../../../redux/hooks';
import useUserId from '../../../hooks/useUserId';
import useService from '../../../hooks/useService';
import GameService from "../../../services/auth-aware/Games"

const ReactionTimeGame: React.FC = () => {
  const [gameState, setGameState] = useState<'waiting' | 'ready' | 'now' | 'done'>('waiting');
  const [message, setMessage] = useState('Click "Start" to begin.');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startGame = () => {
    setMessage('Wait for the button...');
    setGameState('ready');

    const delay = Math.floor(Math.random() * 4000) + 1000; // 1 to 5 seconds

    timerRef.current = setTimeout(() => {
      setGameState('now');
      setMessage('Click now!');
      startTimeRef.current = Date.now();
    }, delay);
  };

  const handleClick = () => {
    if (gameState === 'ready') {
      // Clicked too soon
      if (timerRef.current) clearTimeout(timerRef.current);
      setMessage('Too soon! Try again.');
      setGameState('done');
    } else if (gameState === 'now') {
      const reaction = Date.now() - startTimeRef.current;
      setReactionTime(reaction);
      if (bestTime === null || reaction < bestTime) {
        setBestTime(reaction);
      }
      setMessage(`Your time: ${reaction} ms`);
      setGameState('done');
    } else if (gameState === 'waiting' || gameState === 'done') {
      startGame();
    }
  };

  const scores = useAppSelector(state => state.games.scores)
  const userId = useUserId()
  const gamesService = useService(GameService)

  useEffect(() => {
    if (gameState === 'done') {
      const maybeUpdateScore = async () => {
        const myScore = scores.find(score => score.userId === userId)
        const myBestScore = myScore?.bestScore ?? 0

        if (reactionTime! < myBestScore) {
          try {
            await gamesService.newGameBestScore("ReactionTime", reactionTime!)
            alert(`new best score!!`)
          } catch (e) {
            alert(e)
          }
        }
      }

      maybeUpdateScore()
    }
  }, [gameState])

  return (
    <>
      <div className="reactionTime-container">
        <h1 className="reactionTime-title">ReactionTime Game</h1>
        <div className="reactionTime-info">
          {reactionTime !== null && <p>Your time: <strong>{reactionTime} ms</strong></p>}
          {bestTime !== null && <p>Best time: <strong>{bestTime} ms</strong></p>}
        </div>
        <div className="reactionTime-message">{message}</div>

        <button
          className={`reactionTime-button ${gameState}`}
          onClick={handleClick}
          disabled={gameState === 'ready'}
        >
          {gameState === 'waiting' || gameState === 'done' ? 'Start' : 'Click!'}
        </button>
      </div>

      <h1>My followers best scores</h1>
      <TopThreeScores
        scores={scores}
      />

    </>
  );
};

export default ReactionTimeGame;
