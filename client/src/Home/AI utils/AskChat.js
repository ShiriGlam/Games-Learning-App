// src/components/AskChat.js
import React, { useState } from 'react';
import './AskChat.css'
const AskChat = ({ onSetGenerated, onClose }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const askChatGPT = async () => {
    if (!question) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/ask-gpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();
      if (data.words) {
        onSetGenerated({
          setName: `From ChatGPT: ${question}`,
          words: data.words,
        });
      } else {
        alert('No words received from ChatGPT.');
      }
    } catch (err) {
      console.error('Error communicating with ChatGPT API:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ask-chat-modal">
      <h2>Ask ChatGPT🧠</h2>
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="💡e.g., Give me basic English words for beginners"
      />
      <button onClick={askChatGPT} disabled={loading} className="cta-button">
        {loading ? 'Asking...' : 'Ask'}
      </button>
      <button onClick={onClose} className="back-button">Close</button>
    </div>
  );
};

export default AskChat;
