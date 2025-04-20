import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom';
import SetPage from '../src/Home/SetPage';
import { updateGamePopularity } from '../src/Home/popularity';
import React from 'react';

jest.mock('../src/Home/popularity', () => ({
  updateGamePopularity: jest.fn(),
}));

jest.mock('react-router-dom', () => {
	const originalModule = jest.requireActual('react-router-dom');
	return {
	  ...originalModule,
	  useNavigate: jest.fn(),
	  useParams: jest.fn(() => ({ setName: 'Test Set' })), // Mock setName
	};
  });
  
  describe('SetPage Component', () => {
	let navigateMock;
	
	beforeEach(() => {
	  navigateMock = require('react-router-dom').useNavigate;
	  document.cookie = 'token=mocked-jwt-token';
	  navigateMock.mockClear();
	  global.fetch = jest.fn();
	  require('react-router-dom').useParams.mockReturnValue({ setName: 'Test Set' });
	});
  
	afterEach(() => {
	  jest.clearAllMocks();
	});

	test('searches for games and displays results', async () => {
		global.fetch
		  .mockResolvedValueOnce({
			ok: true,
			json: async () => ({
			  success: true,
			  set: {
				name: 'Test Set',
				words: [
				  { word: 'hello', meaning: 'greeting' },
				  { word: 'world', meaning: 'earth' },
				],
			  },
			}),
		  }) // fetchSetDetails
		  .mockResolvedValueOnce({
			ok: true,
			json: async () => [
			  {
				name: 'Game 1',
				createdBy: 'UserID',
				creator: 'John Doe',
				language: 'JavaScript',
				popularity: 100,
				usersPlayed: 10,
				category: 'Fun',
				code: 'gameCode1',
				css: 'gameCss1',
				averageRating: 4.5,
				imageUrl: '/game1.png',
			  },
			],
		  }) // fetchGamesTop3
		  .mockResolvedValueOnce({
			ok: true,
			json: async () => ({
			  success: true,
			  set: {
				words: [
				  { word: 'weak1', meaning: 'meaning1' },
				  { word: 'weak2', meaning: 'meaning2' },
				],
			  },
			}),
		  }); // fetchSetWeakWords
	  
		render(
		  <Router>
			<SetPage />
		  </Router>
		);
	  
		await waitFor(() => {
		  expect(screen.getByText(/Word Set: Test Set/i)).toBeInTheDocument();
		});
	  
		fireEvent.change(screen.getByPlaceholderText('Search games...'), {
		  target: { value: 'Game' },
		});
	  
		await waitFor(() => {
		  expect(screen.getByText('Game 1')).toBeInTheDocument();
		});
	  });
	  
	  
	  
	  
  });
  