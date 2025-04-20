import React, { useEffect, useState } from 'react';
import './AIHelper.css';
const AIHelper = ({ failedWords }) => {
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAdvice = async () => {
      if (!failedWords || failedWords.length === 0) return;

      setLoading(true);
      try {
        const response = await fetch('http://localhost:3001/api/ask-gpt-advice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ failedWords })
        });

        const data = await response.json();
        if (data.success) setAdvice(data.advice);
        else setAdvice('Failed to get advice.');
      } catch (err) {
        console.error('Error fetching AI advice:', err);
        setAdvice('Something went wrong while getting advice.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdvice();
  }, [failedWords]);

  if (!failedWords || failedWords.length === 0) {
    return <p className="ai-message">✨ You're doing great! No weak areas to analyze right now.</p>;
  }

  return (

    <div className="ai-helper-box">
      <h4>Your Personal Learning Assistant Says:</h4>
      {loading ? <p>Loading advice...</p> : <p className="ai-message">{advice}</p>}
    </div>

  );
};

export default AIHelper;
