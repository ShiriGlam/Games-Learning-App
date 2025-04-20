import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserSets.css';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const UserSets = () => {
  const [sets, setSets] = useState([]); // לשמור את הסטים שנשלפו מהשרת
  const [loading, setLoading] = useState(true); // לשליטה על טעינה
  const navigate = useNavigate();
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };
  
  const token = getCookie('token');
  
  // שליפת הסטים כשהרכיב נטען
  useEffect(() => {
    const fetchSets = async () => {
      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId;
        const response = await fetch(`http://localhost:3001/api/users/${userId}/sets`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
          },
        });    
        const data = await response.json();
        if (data.success) {
          setSets(data.createdSets); // שמירת הסטים שנשלפו
        }
      } catch (err) {
        console.error('Error fetching sets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSets();
  }, []);

  const handleSelectSet = (setName) => {
    navigate(`/set/${setName}`); // ניווט לעמוד הסט
  };

  if (loading) {
    return <div>Loading...</div>; // מסך טעינה
  }

  return (
    <div className="user-sets">
      <h1><img src="/images/Archive.png" alt="icon" className="Archive-button" />Your Sets</h1>
      <ul>
        {sets && sets.length > 0 ? (
          sets.map((set) => (
            <li key={set._id}>
              <div>
                <h4>{set.name}</h4>
                <p>{sets && set.words.length} words in this set...</p>
              </div>
              <button onClick={() => handleSelectSet(set.name)} className="cta-button-select">
                Select Set</button>
            </li>
          ))
        ) : (
          <li>No sets available.</li>
        )}
      </ul>
      <div className="create-new-set">
      <button
  onClick={() => navigate('/create-set')}
  className="create-new-set"
>
  Create Set
</button>

      </div>
    </div>
  );
};


export default UserSets;
