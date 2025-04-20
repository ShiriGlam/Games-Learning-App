import React, { useState } from 'react';
import './CreateSet.css';
import { useNavigate } from 'react-router-dom';

const CreateSet = () => {
  const [words, setWords] = useState([{ word: '', meaning: '' }]);
  const [setName, setSetName] = useState(''); // Set name for the word set
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };
  const navigate = useNavigate();

  const token = getCookie('token');
  console.log(document.cookie);
  const handleAddWord = () => {
    setWords([...words, { word: '', meaning: '' }]);
  };

  const handleChange = (index, event) => {
    const newWords = words.slice();
    newWords[index][event.target.name] = event.target.value;
    setWords(newWords);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const wordSetData = {
      setName,
      words
    };

    try {
      const response = await fetch('http://localhost:3001/api/sets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,        },
        body: JSON.stringify(wordSetData),
      });
      console.log('token:', token);
      const data = await response.json();

      if (data.success) {
        console.log('Word set created successfully', data);
      // Reset the form after a successful submission
        setWords([{ word: '', meaning: '' }]);
        setSetName('');
        navigate(`/set/${setName}`);
      
        // Optionally, redirect the user to a new page
      } else {
        console.error('Failed to create words set:', data.message);
        alert( data.message);
      }
    } catch (err) {
      console.error('Error creating words set:', err);

    }
  };

  return (
    <div className="create-set-page">
            <div className="video-container">
        <video autoPlay muted loop className="background-video">
          <source src="videos/English.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <h1>Create New Word Set</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="setName">Set Name</label>
          <input
            type="text"
            id="setName"
            placeholder="Enter set name"
            value={setName}
            onChange={(e) => setSetName(e.target.value)}
            required
          />
        </div>
        {words.map((word, index) => (
          <div key={index} className="word-input">
            <input
              type="text"
              name="word"
              placeholder="Enter word"
              value={word.word}
              onChange={(e) => handleChange(index, e)}
              required
            />
            <input
              type="text"
              name="meaning"
              placeholder="Enter meaning"
              value={word.meaning}
              onChange={(e) => handleChange(index, e)}
              required
            />
          </div>
        ))}
        <button type="button" onClick={handleAddWord}>
          Add Another Word
        </button>
        <button type="submit" className="cta-button">
          Save Word Set
        </button>
      </form>
    </div>
  );
};

export default CreateSet;

