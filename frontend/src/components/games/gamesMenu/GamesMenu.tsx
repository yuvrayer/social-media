import React, { useState } from 'react';

// Import all your games
import ButtonClickGame from '../buttonClick/ButtonClickGame';
import ReactionTimeGame from '../reactionTime/ReactionTimeGame';
import MemoryMatchGame from '../memoryMatch/MemoryMatchGame';
import WhackTheDotGame from '../whackTheDot/WhackTheDotGame';
import AvoiderGame from '../avoider/AvoiderGame';
import { useDispatch } from 'react-redux';
import { setIsGameOpen } from '../../../redux/games';

type GameKey =
    | 'ButtonClick'
    | 'ReactionTime'
    | 'MemoryMatch'
    | 'WhackTheDot'
    | 'Avoider';

const gamesMap: Record<GameKey, React.ReactNode> = {
    ButtonClick: <ButtonClickGame />,
    ReactionTime: <ReactionTimeGame />,
    MemoryMatch: <MemoryMatchGame />,
    WhackTheDot: <WhackTheDotGame />,
    Avoider: <AvoiderGame />,
};

const GameMenu: React.FC = () => {
    const [selectedGame, setSelectedGame] = useState<GameKey | null>(null);
    const dispatch = useDispatch()

    return (
        <div style={{ padding: 20 }}>
            {!selectedGame && (
                <>
                    <h2>Select a Game</h2>
                    <ul>
                        {Object.keys(gamesMap).map((game) => (
                            <li key={game}>
                                <button onClick={() => {
                                    setSelectedGame(game as GameKey)
                                    dispatch(setIsGameOpen(true))
                                }}>
                                    {game}
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {selectedGame && (
                <div>
                    <button onClick={() => {
                        setSelectedGame(null)
                        dispatch(setIsGameOpen(false))
                    }}>Back to Menu</button>
                    <h2>{selectedGame}</h2>
                    <div>{gamesMap[selectedGame]}</div>
                </div>
            )}
        </div>
    );
};

export default GameMenu;
