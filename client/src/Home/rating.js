import React, { useState } from 'react';

const Rating = ({ gameId, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0); //Temporary ranking
  const [showThankYou, setShowThankYou] = useState(false);

  const handleRating = async (value) => {
    try {
      const response = await fetch(`http://localhost:3001/api/games/${gameId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: value }),
      });

      const data = await response.json();
      if (data.success) {
        console.log('Game rated successfully');
        setRating(value);
        setShowThankYou(true);
        setTimeout(() => {
          setShowThankYou(false);
          onClose();
        }, 1000);
      } else {
        console.error('Failed to update rating:', data.message)
        alert(`Error: ${data.message}`);;
      }

    } catch (error) {
      console.error('Error rating game:', error);
      alert('There was an error submitting your rating.');
    }
  };

  return (
    <div>
      <div className="rating-container">
        <h3>Rate the Game</h3>
        <div className="stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
              onClick={() => handleRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            >
              ★
            </span>
          ))}
        </div>
      </div>
      {showThankYou && (
        <div className="thank-you-container">
          <p>Thank you for rating!</p>
        </div>
      )}
    </div>
  );
};

export default Rating;
