// src/components/RecommendationsMenu.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RecommendationsMenu.css';
import { jwtDecode } from 'jwt-decode';
import Papa from 'papaparse';
import AskChat from './AI utils/AskChat';
import SetNameModal from './AI utils/SetNameModel';

const RecommendationsMenu = () => {
  const navigate = useNavigate();
  const [pendingNameRequest, setPendingNameRequest] = useState(false);
  const [pendingChatSet, setPendingChatSet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importType, setImportType] = useState(null);
  const [category, setCategory] = useState('');
  const [wordList, setWordList] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [setName, setSetName] = useState(null);
  const [showAskChat, setShowAskChat] = useState(false);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  const token = getCookie('token');

  const chooseSet = (words) => {
    navigate(`/set/${words._id}`);
  };

  const importSetByCategory = async () => {
    setLoading(true);
    try {
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;

      const response = await fetch(`http://localhost:3001/api/users/${userId}/import-set-by-category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ category })
      });

      const data = await response.json();
      if (data.success) {
        setWordList(data.set);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error importing set:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const createSet = async (set) => {
    try {
      const response = await fetch('http://localhost:3001/api/sets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(set),
      });

      const data = await response.json();
      if (data.success) {
        alert('Set imported successfully!');
        return data.set; 
      } else {
        console.error('Failed to import set:', data.message);
      }
    } catch (error) {
      console.error('Error importing set:', error);
    }
  };

  const processCsvFile = () => {
    if (!csvFile || !setName) {
      alert('Please upload a CSV file and enter a name!');
      return;
    }

    Papa.parse(csvFile, {
      header: true,
      complete: async (results) => {
        const words = results.data
          .filter((row) => row.word && row.meaning)
          .map((row) => ({
            word: row.word || row.Word,
            meaning: row.meaning || row.Meaning,
          }));

        if (words.length === 0) {
          alert('No valid rows found in the CSV file.');
          return;
        }

        const wordSetData = { setName, words };

        try {
          const response = await fetch('http://localhost:3001/api/sets/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(wordSetData),
          });

          const data = await response.json();
          if (data.success) {
            setWordList(data.set);
            alert('Set imported successfully!');
          } else {
            console.error('Failed to import set:', data.message);
          }
        } catch (error) {
          console.error('Error importing set:', error);
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
      },
    });
  };

  return (
    <div className="recommendations-menu">
      <h1>
        <img src="/images/recommand.png" alt="icon" className="Archive-button" />
        Import a Set
      </h1>

      {!importType && (
        <div className="import-options">
          <button onClick={() => setImportType('category')} className="cta-button">Import by Category</button>
          <button onClick={() => setImportType('csv')} className="cta-button">Import from CSV</button>
        </div>
      )}

      {importType === 'category' && (
        <div className="category-form">
          <input
            type="text"
            value={category || ""}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Enter category (e.g., fruits, animals)"
          />
          <button onClick={importSetByCategory} className="cta-button">
            {loading ? 'Loading...' : 'Import Set'}
          </button>
          <button onClick={() => setImportType(null)} className="back-button">Back</button>
        </div>
      )}

      {importType === 'csv' && (
        <div className="csv-form">
          <input
            type="text"
            value={setName || ""}
            onChange={(e) => setSetName(e.target.value)}
            placeholder="Enter set name"
          />
          <input type="file" accept=".csv" onChange={handleFileUpload} />
          <p className="file-format-note">Note: CSV must have 'word' and 'meaning' headers.</p>
          <button onClick={processCsvFile} className="cta-button">Import from CSV</button>
          <button onClick={() => setImportType(null)} className="back-button">Back</button>
        </div>
      )}

      <button onClick={() => setShowAskChat(true)} className="cta-button">Ask ChatGPT</button>

      {wordList.words && importType && (
        <div className="word-list">
          {wordList.words.map((word, index) => (
            <div key={index} className="word-item">
              <p><strong>{word.word}</strong>: {word.meaning}</p>
            </div>
          ))}
          <button onClick={() => setPendingNameRequest(true)} className="select-button">
            Select This Set
          </button>
        </div>
      )}

      {pendingNameRequest && (
        <SetNameModal
          onConfirm={async (chosenName) => {
            const fullSet = {
              setName: chosenName,
              words: wordList.words,
            };

            const createdSet = await createSet(fullSet);
            setPendingNameRequest(false);
            if (createdSet) navigate(`/set/${createdSet.name}`);
          }}
          onCancel={() => setPendingNameRequest(false)}
        />
      )}

      {showAskChat && (
        <AskChat
          onSetGenerated={(set) => {
            setWordList(set);
            setImportType('chatgpt');
            setShowAskChat(false);
          }}
          onClose={() => setShowAskChat(false)}
        />
      )}
    </div>
  );
};

export default RecommendationsMenu;
