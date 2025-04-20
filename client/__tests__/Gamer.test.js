import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Gamer from '../src/Gamer/Gamer';
import '@testing-library/jest-dom';
import CodeEditor from '../src/Gamer/CodeEditor';
import React from 'react';


global.fetch = jest.fn();

describe('Gamer Component', () => {
  beforeEach(() => {
    global.fetch.mockClear();
	
  });

  test('fetches and displays games list', async () => {
	const mockGames = [
	  {
		_id: '1',
		name: 'Test Game',
		creator: 'John Doe',
		language: 'JavaScript',
		popularity: 100,
		averageRating: 4.5,
		category: 'Action',
		imageUrl: '/path/to/image',
	  },
	];
  
	global.fetch.mockResolvedValueOnce({
	  ok: true,
	  json: async () => mockGames,
	});
  
	render(
	  <Router>
		<Gamer />
	  </Router>
	);
  
	await waitFor(() => {
	  expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/api/games/get', expect.any(Object));
	});
  });

  jest.mock('@monaco-editor/react', () => ({
	Editor: ({ value, onChange }) => (
	  <textarea
		aria-label="Code Editor"
		value={value}
		onChange={(e) => onChange(e.target.value)}
	  />
	),
  }));
  
  test('opens the Add New Game modal successfully', async () => {
	global.fetch = jest.fn().mockResolvedValueOnce({ ok: true, json: async () => [] });
  
	render(
	  <Router>
		<Gamer />
	  </Router>
	);
  
	// וודא שהכפתור מופיע ולחץ עליו
	await waitFor(() => expect(screen.getByText('Add New Game')).toBeInTheDocument());
	fireEvent.click(screen.getByText('Add New Game'));
  
	// אמת שה-modal נפתח
	expect(screen.getByText('Add a New Game')).toBeInTheDocument();
  });
 
  
});
