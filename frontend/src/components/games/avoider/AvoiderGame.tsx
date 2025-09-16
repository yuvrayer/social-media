import React, { useEffect, useRef, useState } from 'react';
import './AvoiderGame.css';

type Block = {
  id: number;
  x: number;
  y: number;
};

interface DocumentWithWebkit extends Document {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void>;
  webkitRequestFullscreen?: () => Promise<void>;
}

const BLOCK_WIDTH = 40;
const BLOCK_HEIGHT = 40;
const INITIAL_FALL_SPEED = 2;
const INITIAL_BLOCK_INTERVAL = 1200;
const MIN_BLOCK_INTERVAL = 400;
const MAX_FALL_SPEED = 10;

const AvoiderGame: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [playerPos, setPlayerPos] = useState({ x: 150, y: 400 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeSurvived, setTimeSurvived] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [fallSpeed, setFallSpeed] = useState(INITIAL_FALL_SPEED);
  const [blockInterval, setBlockInterval] = useState(INITIAL_BLOCK_INTERVAL);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const blockIdRef = useRef(0);
  const survivalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const difficultyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const playerRef = useRef(playerPos);
  const blocksRef = useRef(blocks);

  useEffect(() => {
    playerRef.current = playerPos;
  }, [playerPos]);

  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  // Fullscreen cross-browser support document reference
  const doc = document as DocumentWithWebkit;

  useEffect(() => {
    const onFullscreenChange = () => {
      const fsElement =
        document.fullscreenElement || doc.webkitFullscreenElement || null;
      setIsFullscreen(!!fsElement);
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener(
        'webkitfullscreenchange',
        onFullscreenChange
      );
    };
  }, [doc]);

  const spawnBlock = () => {
    const gameArea = gameAreaRef.current;
    if (!gameArea) return;

    const maxWidth = gameArea.offsetWidth - BLOCK_WIDTH;
    const baseX = Math.random() * maxWidth;
    const id = blockIdRef.current++;

    const newBlocks: Block[] = [{ id, x: baseX, y: 0 }];

    // ~30% chance to spawn a second block nearby (but not overlapping)
    if (Math.random() < 0.3) {
      const offset = (Math.random() < 0.5 ? -1 : 1) * (BLOCK_WIDTH + 10); // +/- direction
      const secondX = Math.min(Math.max(0, baseX + offset), maxWidth);
      const secondId = blockIdRef.current++;
      newBlocks.push({ id: secondId, x: secondX, y: 0 });
    }

    setBlocks((prev) => [...prev, ...newBlocks]);
  };

  const increaseDifficulty = () => {
    setFallSpeed((prev) => Math.min(prev + 0.5, MAX_FALL_SPEED));
    setBlockInterval((prev) => Math.max(prev - 100, MIN_BLOCK_INTERVAL));
  };

  useEffect(() => {
    if (!isPlaying) return;

    // Reset values
    setFallSpeed(INITIAL_FALL_SPEED);
    setBlockInterval(INITIAL_BLOCK_INTERVAL);

    // Survival timer
    survivalTimerRef.current = setInterval(() => {
      setTimeSurvived((t) => t + 1);
    }, 1000);

    // Difficulty increases every 5 seconds
    difficultyTimerRef.current = setInterval(() => {
      increaseDifficulty();
    }, 5000);

    // Spawn loop (interval resets dynamically)
    const startSpawnLoop = () => {
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
      spawnIntervalRef.current = setInterval(() => {
        spawnBlock();
        startSpawnLoop(); // restart with new interval
      }, blockInterval);
    };
    startSpawnLoop();

    const checkCollision = (updatedBlocks: Block[]) => {
      const player = playerRef.current;

      for (const block of updatedBlocks) {
        if (
          player.x < block.x + BLOCK_WIDTH &&
          player.x + BLOCK_WIDTH > block.x &&
          player.y < block.y + BLOCK_HEIGHT &&
          player.y + BLOCK_HEIGHT > block.y
        ) {
          endGame();
          break;
        }
      }
    };

    const updateGame = () => {
      setBlocks((prev) => {
        const updatedBlocks = prev
          .map((block) => ({ ...block, y: block.y + fallSpeed }))
          .filter(
            (block) => block.y < (gameAreaRef.current?.offsetHeight || 500)
          );

        checkCollision(updatedBlocks);
        blocksRef.current = updatedBlocks;

        return updatedBlocks;
      });

      animationRef.current = requestAnimationFrame(updateGame);
    };

    animationRef.current = requestAnimationFrame(updateGame);

    return () => {
      if (survivalTimerRef.current) clearInterval(survivalTimerRef.current);
      if (difficultyTimerRef.current) clearInterval(difficultyTimerRef.current);
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
      cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, blockInterval, fallSpeed]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlaying) return;

    const area = gameAreaRef.current;
    if (!area) return;

    const rect = area.getBoundingClientRect();
    const x = e.clientX - rect.left - BLOCK_WIDTH / 2;
    const y = e.clientY - rect.top - BLOCK_HEIGHT / 2;

    const clampedX = Math.min(Math.max(0, x), area.clientWidth - BLOCK_WIDTH);
    const clampedY = Math.min(Math.max(0, y), area.clientHeight - BLOCK_HEIGHT);

    setPlayerPos({ x: clampedX, y: clampedY });
  };

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setTimeSurvived(0);
    setPlayerPos({ x: 150, y: 400 });
    setBlocks([]);
    setFallSpeed(INITIAL_FALL_SPEED);
    setBlockInterval(INITIAL_BLOCK_INTERVAL);
  };

  const endGame = () => {
    setIsPlaying(false);
    setGameOver(true);
  };

  const enterFullscreen = () => {
    const elem = gameAreaRef.current;
    if (!elem) return;

    // Cast to extended type including webkitRequestFullscreen
    const elemAny = elem as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
    };

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elemAny.webkitRequestFullscreen) {
      elemAny.webkitRequestFullscreen();
    }
  };

  const exitFullscreen = () => {
    const docAny = document as Document & {
      webkitExitFullscreen?: () => Promise<void>;
    };

    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (docAny.webkitExitFullscreen) {
      docAny.webkitExitFullscreen();
    }
  };

  return (
    <div className="avoider-container">
      <h1 className="avoider-title">Avoider Game</h1>

      <div
        className="avoider-gameArea"
        ref={gameAreaRef}
        onMouseMove={handleMouseMove}
      >

        <div className="avoider-stats">
          {(isPlaying || gameOver) && <p>Time: {timeSurvived}s</p>}
          {gameOver && (
            <p className="avoider-gameover">
              Game Over! You survived {timeSurvived}s
            </p>
          )}
        </div>

        {isPlaying && (
          <div
            className="avoider-player"
            style={{ left: playerPos.x, top: playerPos.y }}
          />
        )}

        {blocks.map((block) => (
          <div
            key={block.id}
            className="avoider-block"
            style={{ left: block.x, top: block.y }}
          />
        ))}

        {!isPlaying && (
          <button className="avoider-startButton" onClick={startGame}>
            {gameOver ? 'Play Again' : 'Start Game'}
          </button>
        )}
      </div>

      <div className="avoider-controls">
        {!isFullscreen ? (
          <button
            className="avoider-fullscreenButton"
            onClick={enterFullscreen}
          >
            Enter Fullscreen
          </button>
        ) : (
          <button
            className="avoider-exitFullscreenButton"
            onClick={exitFullscreen}
          >
            Exit Fullscreen
          </button>
        )}
      </div>
    </div>
  );
};

export default AvoiderGame;
