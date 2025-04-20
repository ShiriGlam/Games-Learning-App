import React from 'react';
import './Option.css';
import { useNavigate } from 'react-router-dom';
const Option = () => {

    const navigate = useNavigate();

    return (
        <div className="option-page">
            <div className="video-container">
                <video autoPlay muted loop className="background-video-option">
                    <source src="videos/login.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>

            <div className="content-container">
                <h1 className="title">Choose Your Path </h1>
                <p className="subtitle">Whether you're learning or inventing, we've got you covered.</p>
                <div className="buttons">
                <button className="button-primary" onClick={() => navigate('/home')}>
            Practice English
          </button>
          <button className="button-secondary" onClick={() => navigate('/gamer')}>
            Game Inventor
          </button>                </div>
            </div>
        </div>
    );
};

export default Option;
