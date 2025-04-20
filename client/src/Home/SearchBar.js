import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [suggestedWords, setSuggestedWords] = useState([]);
  const navigate = useNavigate();
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };
  const handleInputChange = async (e) => {
    const searchQuery = e.target.value;
    setQuery(searchQuery);

    if (searchQuery.length > 2) {
      try {
        const response = await fetch(`http://localhost:3001/api/sets/search/${searchQuery}`);
        const data = await response.json();
        if (data.success) {
          setResults(data.sets); 
          setSuggestedWords([]); 
        } else {
       
          setResults([]);
          const wordResponse = await fetch(`http://api.datamuse.com/words?ml=${encodeURIComponent(searchQuery)}`);
          const wordData = await wordResponse.json();
          setSuggestedWords(wordData.slice(0, 10)); 
        }
      } catch (err) {
        console.error('Error searching set:', err);
        setResults([]);
        setSuggestedWords([]);
      }
    } else {
      setResults([]);
      setSuggestedWords([]);
    }
  };

  const handleSelectSet = (setId) => {
    navigate(`/set/${setId}`);
  };

  const fetchWordMeaning = async (word) => {
    // תרגום עיי api mymemory
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|he`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      if (data && data.responseData && data.responseData.translatedText) {
        return data.responseData.translatedText;
      } else {
        console.error(`Error translating word ${word}:`, data);
        return 'Translation pending'; // נבצע טיפול במקרה של שגיאה
      }
    } catch (error) {
      console.error(`Error translating word ${word}:`, error);
      return 'Translation pending'; // נבצע טיפול במקרה של שגיאה
    }
  };
  
  const handleCreateSet = async () => {
    const token = getCookie('token');  // נוודא שיש לנו את ה-token מהעוגיות
  
    try {
      // תרגום כל המילים לפני שליחתן לשרת
      const translatedWords = await Promise.all(suggestedWords.map(async (word) => {
        const translation = await fetchWordMeaning(word.word);
        return { word: word.word, meaning: translation }; // המילה המקורית + התרגום
      }));
  
      // שליחת המילים המתורגמות לשרת ליצירת הסט
      const response = await fetch(`http://localhost:3001/api/sets/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // שליחת ה-token בכותרת Authorization
        },
        body: JSON.stringify({
          setName: query, // שם הסט לפי החיפוש
          words: translatedWords // המילים עם התרגום
        })
      });
  
      const data = await response.json();
      if (data.success) {
        navigate(`/set/${data.set._id}`);
      } else {
        console.error('Failed to create set:', data.message);
      }
    } catch (error) {
      console.error('Error creating set:', error);
    }};

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search Set"
        value={query}
        onChange={handleInputChange}
      />

      {/* הצגת התוצאות למטה */}
      <div className="search-results">
        {results.length > 0 ? (
          results.map((set) => (
            <div key={set._id} className="search-result-item" onClick={() => handleSelectSet(set._id)}>
              {set.name}
            </div>
          ))
        ) : (
          query.length > 2 && (
            <div className="search-result-item">
              No matching sets found.
              {suggestedWords.length > 0 && (
                <>
                  <button onClick={handleCreateSet}>if you want to create new one: Create Set with these words</button>
                  <ul>
                    {suggestedWords.map((word, index) => (
                      <li key={index}>{word.word}</li>
                    ))}
                  </ul>
                  
                </>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default SearchBar;
