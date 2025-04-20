export const updateGamePopularity = async (gameId) => {
    try {
      const token = getTokenFromCookies();
      if (!token) {
        console.error('No token found');
        return;
      }
  
      const response = await fetch(`http://localhost:3001/api/games/${gameId}/update-popularity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      if (data.success) {
        console.log('Popularity updated successfully');
      } else {
        console.error('Failed to update popularity:', data.message);
      }
    } catch (error) {
      console.error('Error updating popularity:', error);
    }
  };
  
  // Function that imports the token from cookies
  const getTokenFromCookies = () => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      let [name, value] = cookie.split('=');
      name = name.trim();
      if (name === 'token') {
        return value;
      }
    }
    return null;
  };
  