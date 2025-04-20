import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './SetPage.css';
import './rating.css';
import Wordlist from './WordsList';
import Rating from './rating';
import GamesList from './GamesList';

const SetPage = () => {
  const { setName } = useParams();
  const [setDetails, setSetDetails] = useState(null);
  const [weakWords, setWeakWords] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState([]);
  const [showRating, setShowRating] = useState(false);
  const [gameId, setGameId] = useState(null);
  const navigate = useNavigate();

  const getTokenFromCookies = () => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      let [name, value] = cookie.split('=');
      if (name.trim() === 'token') return value;
    }
    return null;
  };

  const fetchSetDetails = useCallback(async () => {
    try {
      const token = getTokenFromCookies();
      if (!token) return;

      const res1 = await fetch(`http://localhost:3001/api/sets/${setName}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data1 = await res1.json();
      if (data1.success) setSetDetails(data1.set);

      const res2 = await fetch(`http://localhost:3001/api/sets/weaks/${setName}`);
      const data2 = await res2.json();
      if (data2.success) {
        const transformed = data2.set.words.map(w => ({ word: w.word, meaning: w.meaning }));
        setWeakWords(transformed);
      }
    } catch (err) {
      console.error('Error fetching set details:', err);
    } finally {
      setLoading(false);
    }
  }, [setName]);

  const fetchGamesTop3 = useCallback(async () => {
    try {
      const token = getTokenFromCookies();
      const res = await fetch('http://localhost:3001/api/games/gettop3', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) setGames(data);
    } catch (err) {
      console.error('Error fetching games:', err);
    }
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query) return setSearchResults([]);

    try {
      const res = await fetch(`http://localhost:3001/api/games/search/${query}`);
      const data = await res.json();
      if (data.success) setSearchResults(data.games || []);
      else setSearchResults([]);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    }
  };

  const updateSet = async (updatedWords) => {
    try {
      const token = getTokenFromCookies();
      const res = await fetch(`http://localhost:3001/api/sets/${setDetails._id}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ words: updatedWords }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Set updated successfully!');
        setSetDetails(data.set);
      }
    } catch (err) {
      console.error('Error updating set:', err);
    }
  };


  useEffect(() => {
    fetchSetDetails();
    fetchGamesTop3();
  }, [fetchSetDetails, fetchGamesTop3]);

  if (loading) return <div>Loading...</div>;
  if (!setDetails) return <div>Set not found.</div>;

  const backHome = () => navigate('/home');

  return (
    <div className="set-page">
      <div className="video-container">
        <video autoPlay muted loop className="background-video">
          <source src="/videos/signup.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="navbar">
        <h1>Word Set: {setDetails.name}</h1>
      </div>
      <button className="close-button" onClick={backHome}>Back to home</button>

      <div className="container-setpage">
        <div className="menu">
          <div className="menu-item">
            <h3>Games</h3>
            <p>Practice your words with fun and interactive games.</p>

            <GamesList
              games={games}
              searchQuery={searchQuery}
              searchResults={searchResults}
              onSearch={handleSearch}
              words={setDetails.words}
              setIdForRating={(id) => {
                setGameId(id);
                setShowRating(true);
              }}
            />
          </div>

          <div className="words">
            <Wordlist
              setDetails={setDetails}
              weakWords={weakWords}
              updateSet={updateSet}
            />
          </div>
        </div>

        {showRating && (
          <Rating gameId={gameId} onClose={() => setShowRating(false)} />
        )}
      </div>
    </div>
  );
};

export default SetPage;
