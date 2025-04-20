import React, { useState } from 'react';
import './WordsList.css';

const WordsList = ({ setDetails, weakWords, updateSet }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableWords, setEditableWords] = useState([...setDetails.words]);
  const [newWord, setNewWord] = useState('');
  const [newMeaning, setNewMeaning] = useState('');

  const playAudio = (word) => {
    if (window.responsiveVoice) {
      window.responsiveVoice.speak(word, "UK English Male");
    } else {
      console.error("ResponsiveVoice.js is not loaded!");
    }
  };
  const handleWordChange = (index, key, value) => {
    const updatedWords = [...editableWords];
    updatedWords[index][key] = value;
    setEditableWords(updatedWords);
  };

  const handleAddWord = () => {
    if (newWord && newMeaning) {
      setEditableWords([
        ...editableWords,
        { word: newWord, meaning: newMeaning },
      ]);
      setNewWord('');
      setNewMeaning('');
    } else {
      alert('Please fill both word and meaning!');
    }
  };

  const handleDeleteWord = (index) => {
    const updatedWords = editableWords.filter((_, i) => i !== index);
    setEditableWords(updatedWords);
  };

  const handleSaveChanges = () => {
    updateSet(editableWords);
    setIsEditing(false);
  };

  
  return (
    <div className="wordlist-cont">
      <h3>{isEditing ? 'Edit Word List' : 'Word List'}</h3>

      {!isEditing && (
        <>
          <table className="wordlist-table">
            <thead>
              <tr>
                <th>Word</th>
                <th>Meaning</th>
                <th>Status</th>
                <th>Audio</th> 
              </tr>
            </thead>
            <tbody>
              {setDetails.words.map((wordObj, index) => (
                <tr
                  key={index}
                  className={
                    weakWords &&
                    weakWords.some((weakWord) => weakWord.word === wordObj.word)
                      ? 'weak-row'
                      : ''
                  }
                >
                  <td>{wordObj.word}</td>
                  <td>{wordObj.meaning}</td>
                  <td>
                    {weakWords &&
                    weakWords.some((weakWord) => weakWord.word === wordObj.word) ? (
                      <span className="weak-indicator">Weak</span>
                    ) : (
                      <span className="strong-indicator">Strong</span>
                    )}
                  </td>
                  <td>
                    <button onClick={() => playAudio(wordObj.word)} className="audio-button">🔊 Play</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setIsEditing(true)} className="cta-button">
            Edit Set
          </button>
        </>
      )}

      {isEditing && (
        <>
          <table className="wordlist-table">
            <thead>
              <tr>
                <th>Word</th>
                <th>Meaning</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {editableWords.map((wordObj, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      value={wordObj.word}
                      onChange={(e) =>
                        handleWordChange(index, 'word', e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={wordObj.meaning}
                      onChange={(e) =>
                        handleWordChange(index, 'meaning', e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <button onClick={() => handleDeleteWord(index)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            <h4>Add a New Word</h4>
            <input
              type="text"
              value={newWord}
              placeholder="Word"
              onChange={(e) => setNewWord(e.target.value)}
            />
            <input
              type="text"
              value={newMeaning}
              placeholder="Meaning"
              onChange={(e) => setNewMeaning(e.target.value)}
            />
            <button onClick={handleAddWord}>Add Word</button>
          </div>
          <button onClick={handleSaveChanges} className="cta-button">
            Save Changes
          </button>
          <button onClick={() => setIsEditing(false)} className="cta-button">
            Cancel
          </button>
        </>
      )}
    </div>
  );
};

export default WordsList;
