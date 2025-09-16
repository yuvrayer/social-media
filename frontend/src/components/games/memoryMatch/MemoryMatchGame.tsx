import React, { useEffect, useRef, useState } from 'react';
import './MemoryMatchGame.css';

type CardType = {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const generateCards = (): CardType[] => {
  const values = ['🍎', '🍌', '🍇', '🍓', '🍒', '🥝', '🍍', '🍉'];
  const cards = [...values, ...values]
    .map((value, index) => ({
      id: index,
      value,
      isFlipped: false,
      isMatched: false,
    }))
    .sort(() => Math.random() - 0.5);
  return cards;
};

const MemoryMatchGame: React.FC = () => {
  const [cards, setCards] = useState<CardType[]>(generateCards());
  const [flippedCards, setFlippedCards] = useState<CardType[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [isBusy, setIsBusy] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const gameAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement = document.fullscreenElement;
      setIsFullscreen(!!fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (flippedCards.length === 2) {
      setIsBusy(true);
      setTimeout(() => {
        const [first, second] = flippedCards;
        if (first.value === second.value) {
          setCards(prev =>
            prev.map(card =>
              card.value === first.value
                ? { ...card, isMatched: true }
                : card
            )
          );
          setMatchedCount(prev => prev + 1);
        } else {
          setCards(prev =>
            prev.map(card =>
              card.id === first.id || card.id === second.id
                ? { ...card, isFlipped: false }
                : card
            )
          );
        }
        setFlippedCards([]);
        setMoves(prev => prev + 1);
        setIsBusy(false);
      }, 1000);
    }
  }, [flippedCards]);

  const handleCardClick = (card: CardType) => {
    if (card.isFlipped || card.isMatched || isBusy || flippedCards.length === 2) return;

    const updatedCards = cards.map(c =>
      c.id === card.id ? { ...c, isFlipped: true } : c
    );
    setCards(updatedCards);
    setFlippedCards(prev => [...prev, { ...card, isFlipped: true }]);
  };

  const resetGame = () => {
    setCards(generateCards());
    setFlippedCards([]);
    setMoves(0);
    setMatchedCount(0);
    setIsBusy(false);
  };

  const enterFullscreen = async () => {
    try {
      await gameAreaRef.current?.requestFullscreen();
    } catch (err) {
      console.error('Failed to enter fullscreen:', err);
    }
  };

  const exitFullscreen = async () => {
    try {
      await document.exitFullscreen();
    } catch (err) {
      console.error('Failed to exit fullscreen:', err);
    }
  };

  return (
    <div className="memoryMatch-container">
      <h1 className="memoryMatch-title">MemoryMatch Game</h1>

      <div className="memoryMatch-controls">
        {!isFullscreen ? (
          <button onClick={enterFullscreen} className="memoryMatch-fullscreenButton">
            Enter Fullscreen
          </button>
        ) : (
          <button onClick={exitFullscreen} className="memoryMatch-exitFullscreenButton">
            Exit Fullscreen
          </button>
        )}
      </div>

      <div className="memoryMatch-gameArea" ref={gameAreaRef}>
        <div className="memoryMatch-grid">
          {cards.map(card => (
            <div
              key={card.id}
              className={`memoryMatch-card ${card.isFlipped || card.isMatched ? 'flipped' : ''}`}
              onClick={() => handleCardClick(card)}
            >
              <div className="memoryMatch-inner">
                <div className="memoryMatch-front">❓</div>
                <div className="memoryMatch-back">{card.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="memoryMatch-stats">
          <p>Moves: {moves}</p>
          {matchedCount === 8 && <p className="memoryMatch-win">You won! 🎉</p>}
          <button onClick={resetGame} className="memoryMatch-reset">Restart</button>
        </div>
      </div>
    </div>
  );
};

export default MemoryMatchGame;
