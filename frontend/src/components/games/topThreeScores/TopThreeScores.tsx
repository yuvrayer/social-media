import React from 'react';
import './TopThreeScores.css';
import profileImg from "../../../assets/images/profile.jpg"

interface TopThreeScoresProps {
  scores: {
    userId: string;
    name: string;
    profileImgUrl: string;
    bestScore: number;
  }[];
}

const TopThreeScores: React.FC<TopThreeScoresProps> = ({ scores }) => {
  // Sort and slice scores for podium and table
  const sortedScores = [...scores].sort((a, b) => b.bestScore - a.bestScore);
  const topScores = sortedScores.slice(0, 3);
  const otherTopScores = sortedScores.slice(3, 10);

  return (
    <div className="top-three-container">
      {topScores.length === 0 ? (
        <p className="no-scores">No top scores yet.</p>
      ) : (
        <>
          {/* Podium */}
          <div className="podium">
            {/* 2nd Place */}
            {topScores[1] && (
              <div className="podium-slot second">
                <img src={topScores[1].profileImgUrl ?
                  `${import.meta.env.VITE_AWS_SERVER_URL}/${topScores[1].profileImgUrl}`
                  : profileImg
                }
                  alt={topScores[1]?.name || 'Player'} />
                <div className="name">{topScores[1].name}</div>
                <div className="score">🥈 {topScores[1].bestScore}</div>
              </div>
            )}

            {/* 1st Place */}
            {topScores[0] && (
              <div className="podium-slot first">
                <img src={topScores[0].profileImgUrl ?
                  `${import.meta.env.VITE_AWS_SERVER_URL}/${topScores[0].profileImgUrl}`
                  : profileImg
                }
                  alt={topScores[0]?.name || 'Player'} />
                <div className="name">{topScores[0].name}</div>
                <div className="score">🥇 {topScores[0].bestScore}</div>
              </div>
            )}

            {/* 3rd Place */}
            {topScores[2] && (
              <div className="podium-slot third">
                <img src={topScores[0].profileImgUrl ?
                  `${import.meta.env.VITE_AWS_SERVER_URL}/${topScores[2].profileImgUrl}`
                  : profileImg
                }
                  alt={topScores[2]?.name || 'Player'} />
                <div className="name">{topScores[2].name}</div>
                <div className="score">🥉 {topScores[2].bestScore}</div>
              </div>
            )}
          </div>

          {/* Table for ranks 4 to 10 */}
          {otherTopScores.length > 0 && (
            <div className="other-scores-table">
              <h3>Other Top Scores</h3>
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {otherTopScores.map((user, index) => (
                    <tr key={user.userId}>
                      <td>{index + 4}</td>
                      <td>{user.name}</td>
                      <td>{user.bestScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TopThreeScores;
