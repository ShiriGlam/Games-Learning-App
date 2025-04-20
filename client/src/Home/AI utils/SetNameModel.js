// src/components/AI utils/SetNameModel.js
import React, { useState } from 'react';
import './SetNameModel.css';

const SetNameModal = ({ onConfirm, onCancel }) => {
  const [name, setName] = useState('');

  return (
    <div className="inline-name-input">
      <p>📝 Choose a name for your set:</p>
      <input
        type="text"
        value={name}
        placeholder="e.g., Basic Vocabulary"
        onChange={(e) => setName(e.target.value)}
      />
      <div className="inline-buttons">
        <button
          onClick={() => name.trim() && onConfirm(name.trim())}
          className="cta-button"
        >
          Confirm
        </button>
        <button onClick={onCancel} className="back-button">X</button>
      </div>
    </div>
  );
};

export default SetNameModal;
