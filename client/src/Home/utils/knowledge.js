// src/utils/knowledge.js

export async function updateKnowledgeCount(setName, word, wasCorrect) {
	try {
	  const token = getTokenFromCookies();
	  const response = await fetch(`http://localhost:3001/api/sets/update-knowledge/${setName}`, {
		method: 'POST',
		headers: {
		  'Authorization': `Bearer ${token}`,
		  'Content-Type': 'application/json',
		},
		body: JSON.stringify({
		  wordId: word,
		  change: wasCorrect ? 1 : -1,
		  wasCorrect,
		}),
	  });
  
	  const data = await response.json();
	  if (!response.ok || !data.success) {
		console.error('Failed to update knowledge count:', data.message || response.status);
	  }
	} catch (error) {
	  console.error('Error updating knowledge count:', error.message);
	}
  }
  
  function getTokenFromCookies() {
	const cookies = document.cookie.split(';');
	for (let cookie of cookies) {
	  const [name, value] = cookie.trim().split('=');
	  if (name === 'token') return value;
	}
	return null;
  }
  