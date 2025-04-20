import React from 'react';
import './Start.css';

const Start = () => {
    return (
        <div className="start-page">

            <div className="video-container">
                <video autoPlay muted loop className="background-video-start">
                    <source src="videos/background3.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>

            <div className="option-list-start">
                <ul>
                    <li><h3>Learn with Friends</h3></li>
                    <li><h3>Learn with Games</h3></li>
                    <li><h3>Learn for Fun</h3></li>
                </ul>
            </div>

            <div className="container">
            <h1 className="main-title">The simplest way to learn English!</h1>
                <div className="buttons">
                    <a href="/login" className="button">Log In</a>
                </div>
            </div>
        </div>
    );
};

export default Start;
