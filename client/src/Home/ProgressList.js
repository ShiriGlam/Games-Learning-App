import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import './ProgressList.css';
import AIHelper from './AI utils/AIHelper';
import { jwtDecode } from 'jwt-decode';

const ProgressList = () => {
  const [totalWords, setTotalWords] = useState(0);
  const [knownWords, setKnownWords] = useState(0);
  const [failedWords, setFailedWords] = useState([]);
  const [isHelperOpen, setIsHelperOpen] = useState(false);

  const extractFailedWords = (sets) => {
    const failed = [];
    sets.forEach(set => {
      set.words.forEach(word => {
        const wrongs = word.answersHistory?.filter(a => a.answeredCorrectly === false) || [];
        if (wrongs.length >= 1 && !failed.includes(word.word)) {
          failed.push(word.word);
        }
      });
    });
    return failed;
  };

  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        const token = document.cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1];
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId;

        const response = await fetch(`http://localhost:3001/api/users/${userId}/progress`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (data.success) {
          const failed = extractFailedWords(data.sets);
          setFailedWords(failed);

          let total = 0;
          let known = 0;
          data.sets.forEach(set => {
            set.words.forEach(word => {
              total += 1;
              if (word.knowledgeCount > 0) known += 1;
            });
          });

          setTotalWords(total);
          setKnownWords(known);
        }
      } catch (err) {
        console.error('Error fetching user progress:', err);
      }
    };

    fetchUserProgress();
  }, []);

  const pieData = {
    labels: ['Known Words', 'Unknown Words'],
    datasets: [
      {
        data: [knownWords, totalWords - knownWords],
        backgroundColor: ['#94b4d6', '#ff6384'],
        hoverBackgroundColor: ['#166fe5', '#ff6384']
      }
    ]
  };

  return (
    <div className="progress-list">
      <h3>
        <img src="/images/Progress.png" alt="icon" className="Archive-button" />
        Your Progress
      </h3>


      {!isHelperOpen && (
        <>
          <div className="pie-chart-container">
            <Pie data={pieData} />
          </div>
  
          <div className="word-progress">
            <p>Total words: {totalWords}</p>
            <p>Known words: {knownWords}</p>
          </div>
        </>
      )}
  
      {failedWords.length > 0 && (
        <div className="ai-center-wrapper">
          <button className="cta-button-ai" onClick={() => setIsHelperOpen(!isHelperOpen)}>
            {isHelperOpen ? 'Hide Advice🤖' : '❓Ask Your Personal AI Coach For Advice❓'}
          </button>
  
          {isHelperOpen && (
            <div className="ai-helper-overlay">
              <AIHelper failedWords={failedWords} />
            </div>
          )}
        </div>
      )}
    </div>
  );
  
};

export default ProgressList;
