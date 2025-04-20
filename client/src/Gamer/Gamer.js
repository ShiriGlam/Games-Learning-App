import React, { useState, useEffect } from 'react';
import './Gamer.css';

import { updateGamePopularity } from '../Home/popularity';
import CodeEditor from './CodeEditor';
import CssEditor from './CssEditor';
import { jwtDecode } from 'jwt-decode';
import Runner from './Runner';

const Gamer = () => {
  const [games, setGames] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState('manual');
  const [zipFile, setZipFile] = useState(null);
  const [newGame, setNewGame] = useState({
    name: '',
    creator: '',
    language: 'JavaScript',
    category: '',
    code: '',
    css: '',
  });

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  const token = getCookie('token');

  useEffect(() => {
    fetchGames().catch((error) => {
      console.error('Error fetching games:', error);
      setGames([]);
    });
  }, []);

  const fetchGames = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/games/get', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setGames(data);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setNewGame({ ...newGame, image: reader.result });
      };
      reader.readAsDataURL(files[0]);
    } else {
      setNewGame({ ...newGame, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (uploadMode === 'zip') {
        const formData = new FormData();
        formData.append('zipFile', zipFile);
        formData.append('name', newGame.name);
        formData.append('creator', newGame.creator);
        formData.append('language', newGame.language);
        formData.append('category', newGame.category);

        const response = await fetch('http://localhost:3001/api/games/upload-zip', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) throw new Error('Failed to upload ZIP game');
        const newGameData = await response.json();
        setGames([...games, newGameData]);
        setModalOpen(false);
      } else {
        const response = await fetch('http://localhost:3001/api/games/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newGame),
        });

        if (!response.ok) throw new Error('Failed to create game');
        const newGameData = await response.json();
        setGames([...games, newGameData]);
        setModalOpen(false);
      }
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  const deleteGame = async (gameId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this game?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:3001/api/games/delete/${gameId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete game');
      const data = await response.json();

      if (data.success) {
        setGames(games.filter((game) => game._id !== gameId));
        alert('Game deleted successfully!');
      } else {
        console.error('Failed to delete game:', data.message);
      }
    } catch (error) {
      console.error('Error deleting game:', error.message);
    }
  };

  const getUserIdFromToken = () => {
    const token = getCookie('token');
    if (!token) return null;
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.userId;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  return (
    <div className="gamer-page">
      <div className="video-container">
        <video autoPlay muted loop className="background-video-gamer">
          <source src="videos/Games.mp4" type="video/mp4" />
        </video>
      </div>
      <h1>Games List</h1>
      <button className="cta-button" onClick={() => {
        setNewGame({ name: '', language: '', creator: '', category: '', code: '', image: null });
        setZipFile(null);
        setUploadMode('manual');
        setModalOpen(true);
      }}>Add New Game</button>
      <table className="game-table">
        <thead>
          <tr>
            <th>Game Name</th>
            <th>Creator</th>
            <th>Language</th>
            <th>Popularity</th>
            <th>Rating</th>
            <th>Category</th>
            <th>Image</th>
            <th>Play</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game, index) => (
            <tr key={index}>
              {game.createdBy === getUserIdFromToken() && (
                <td><button onClick={() => deleteGame(game._id)} className="delete-button">Delete</button></td>
              )}
              <td>{game.name}</td>
              <td>{game.creator}</td>
              <td>{game.language}</td>
              <td>{game.popularity}</td>
              <td>{game.averageRating?.toFixed(2) || 'N/A'}</td>
              <td>{game.category}</td>
              <td>
                <img src={game.imageUrl} alt={game.name} style={{ width: '50px', height: 'auto' }} />
              </td>
              <td>
              <Runner gameId={game._id} entryFile={game.entryFile} gameFolderPath={game.gameFolderPath} />

              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setModalOpen(false)}>&times;</span>
            <h2>Add a New Game</h2>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <ul>
                <li>
                  <label htmlFor="gameName">Game Name:</label>
                  <input
                    id="gameName"
                    type="text"
                    name="name"
                    value={newGame.name}
                    onChange={handleChange}
                    required
                  />
                </li>
                <li>
                  <label htmlFor="language">Language:</label>
                  <select
                    id="language"
                    name="language"
                    value={newGame.language}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select</option>
                    <option value="JavaScript">JavaScript</option>
                  </select>
                </li>
                <li>
                  <label htmlFor="creator">Creator:</label>
                  <input
                    id="creator"
                    type="text"
                    name="creator"
                    value={newGame.creator}
                    onChange={handleChange}
                    required
                  />
                </li>
                <li>
                  <label htmlFor="category">Category:</label>
                  <select
                    id="category"
                    name="category"
                    value={newGame.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select</option>
                    <option value="Action">Action</option>
                    <option value="Cards">Cards</option>
                    <option value="Another">Another</option>
                  </select>
                </li>
                <li>
                  <div className="upload-mode-toggle">
                    <label>
                      <input
                        type="radio"
                        value="manual"
                        checked={uploadMode === 'manual'}
                        onChange={() => setUploadMode('manual')}
                      />
                      Manual Code
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="zip"
                        checked={uploadMode === 'zip'}
                        onChange={() => setUploadMode('zip')}
                      />
                      Upload ZIP
                    </label>
                  </div>
                </li>
                {uploadMode === 'manual' && (
                  <>
                    <li>
                      Game Code:
                      <CodeEditor code={newGame.code} setCode={(code) => setNewGame({ ...newGame, code })} />
                    </li>
                    <li>
                      Add Styles (CSS):
                      <CssEditor cssCode={newGame.css} setCssCode={(css) => setNewGame({ ...newGame, css })} />
                    </li>
                    <li>
                      Game Image:
                      <input type="file" name="gameImage" onChange={handleChange} />
                    </li>
                  </>
                )}
                {uploadMode === 'zip' && (
                  <li>
                    <label>Upload Game ZIP:</label>
                    <input
                      type="file"
                      accept=".zip"
                      onChange={(e) => setZipFile(e.target.files[0])}
                      required
                    />
                  </li>
                )}
              </ul>
              <button type="submit">Submit</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gamer;
