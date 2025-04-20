import React from 'react';
import Runner from '../Gamer/Runner';
import { updateKnowledgeCount } from './utils/knowledge';
import { useParams } from 'react-router-dom';

const GamesList = ({ games, searchQuery, searchResults, onSearch, words, setIdForRating }) => {
	const { setName } = useParams();
  const groupByCategory = (games) => {
    return games.reduce((acc, game) => {
      if (!acc[game.category]) {
        acc[game.category] = [];
      }
      acc[game.category].push(game);
      return acc;
    }, {});
  };

  const groupedGames = games ? groupByCategory(games) : {};

  return (
    <>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search games..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="search-box"
        />
        {searchQuery && (
          <div className="search-results">
            {searchResults.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Creator</th>
                    <th>Language</th>
                    <th>Popularity</th>
                    <th>Users Played</th>
                    <th>Category</th>
                    <th>Image</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((game, index) => (
                    <tr key={index}>
                      <td>{game.name}</td>
                      <td>{game.creator}</td>
                      <td>{game.language}</td>
                      <td>{game.popularity}</td>
                      <td>{game.usersPlayed}</td>
                      <td>{game.category}</td>
                      <td>
                        <img
                          src={game.imageUrl}
                          alt={game.name}
                          style={{ width: '50px', height: 'auto' }}
                        />
                      </td>
                      <td>
                      <Runner
  gameId={game._id}
  gameUrl={game.gameUrl}
  words={words}
  onPlayed={(result, details) => {
    updateKnowledgeCount(setName, details.word, result === 'success');
    setIdForRating(game._id);
  }}
/>


                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-results">No results found</div>
            )}
          </div>
        )}
      </div>

      <div className="submenugame">
        <h3>Game Category:</h3>
        {Object.keys(groupedGames).map((category) => (
          <div key={category} className="category-section">
            <h3 className="category-header">{category}:</h3>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Creator</th>
                  <th>Language</th>
                  <th>Popularity</th>
                  <th>Category</th>
                  <th>Image</th>
                  <th>Rating</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {groupedGames[category].map((game, index) => (
                  <tr key={index}>
                    <td>{game.name}</td>
                    <td>{game.creator}</td>
                    <td>{game.language}</td>
                    <td>{game.popularity}</td>
                    <td>{game.category}</td>
                    <td>
                      <img
                        src={game.imageUrl || '/placeholder.png'}
                        alt={game.name}
                        style={{ width: '50px', height: 'auto' }}
                      />
                    </td>
                    <td>{game.averageRating?.toFixed(2) || 'N/A'}</td>
                    <td>
                    <Runner
  gameId={game._id}
  gameUrl={game.gameUrl}
  words={words}
  onPlayed={(result, details) => {
    updateKnowledgeCount(setName, details.word, result === 'success');
    setIdForRating(game._id);
  }}
/>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </>
  );
};

export default GamesList;
