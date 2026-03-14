import React, { useEffect, useState } from 'react';
import './GameMenu.css';
import ButtonClickGame from '../buttonClick/ButtonClickGame';
import ReactionTimeGame from '../reactionTime/ReactionTimeGame';
import MemoryMatchGame from '../memoryMatch/MemoryMatchGame';
import WhackTheDotGame from '../whackTheDot/WhackTheDotGame';
import AvoiderGame from '../avoider/AvoiderGame';
import { useDispatch } from 'react-redux';
import { setIsGameOpen, setScores } from '../../../redux/games';
import useService from '../../../hooks/useService';
import GamesService from "../../../services/auth-aware/Games"
import TopThreeScores from '../topThreeScores/TopThreeScores';

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
    const dispatch = useDispatch();
    const gamesService = useService(GamesService)

    useEffect(() => {
        if (selectedGame) {
            const handleGameEnter = async () => {
                try {
                    const friendResults = await gamesService.getGamesBestScores(selectedGame)
                    dispatch(setScores(friendResults))
                } catch (error) {
                    console.error('Error on game start:', error);
                }
            };

            handleGameEnter();
        } else {
            dispatch(setScores([]))
        }
    }, [selectedGame]);

    return (
        <>
            <div className="game-menu">
                {!selectedGame && (
                    <div className="game-menu-selection">
                        <h2 className="game-menu-title">🎮 Select a Game</h2>
                        <ul className="game-list">
                            {Object.keys(gamesMap).map((game) => (
                                <li key={game}>
                                    <button
                                        className="game-button"
                                        onClick={() => {
                                            setSelectedGame(game as GameKey);
                                            dispatch(setIsGameOpen(true));
                                        }}
                                    >
                                        {game}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <TopThreeScores
                            scores={[
                                {
                                    userId: '1',
                                    name: 'Alice',
                                    profileImgUrl: '/avatars/alice.png',
                                    bestScore: 980,
                                },
                                {
                                    userId: '2',
                                    name: 'Bob',
                                    profileImgUrl: '/avatars/bob.png',
                                    bestScore: 860,
                                },
                                {
                                    userId: '3',
                                    name: 'Charlie',
                                    profileImgUrl: '/avatars/charlie.png',
                                    bestScore: 750,
                                },
                                {
                                    userId: '4',
                                    name: 'Forth',
                                    profileImgUrl: '/avatars/charlie.png',
                                    bestScore: 710,
                                },
                                {
                                    userId: '5',
                                    name: 'fifth',
                                    profileImgUrl: '/avatars/charlie.png',
                                    bestScore: 70,
                                },
                            ]}
                        />
                    </div>
                )}

                {selectedGame && (
                    <div className="game-container">
                        <button
                            className="back-button"
                            onClick={() => {
                                setSelectedGame(null);
                                dispatch(setIsGameOpen(false));
                            }}
                        >
                            ⬅ Back to Menu
                        </button>
                        <h2 className="game-title">{selectedGame}</h2>
                        <div className="game-content">{gamesMap[selectedGame]}</div>
                    </div>
                )}
            </div>
        </>
    );
};

export default GameMenu;
