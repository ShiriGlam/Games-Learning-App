import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom';
import Login from '../src/Login/Login';
import Option from '../src/Option';
import CreateSet from '../src/Home/CreateSet';
import UserSets from '../src/Home/UserSets';
import fetchMock from 'jest-fetch-mock';
import dotenv from 'dotenv';
import React from 'react';

dotenv.config(); // טוען את משתני הסביבה מקובץ .env

// Mock Google Login component
jest.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }) => <div>{children}</div>,
  GoogleLogin: ({ onSuccess }) => (
    <button onClick={() => onSuccess({ credential: 'mocked-jwt-token' })}>
      Mock Google Login
    </button>
  ),
}));

// Mock useNavigate from react-router-dom
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  const navigateMock = jest.fn(); // מגדירים את navigateMock כאן
  return {
    ...originalModule,
    useNavigate: () => navigateMock,
    navigateMock, // מייצאים אותו לשימוש במבחנים
  };
});

describe('Login Component', () => {
  let navigateMock;

  beforeEach(() => {
    fetchMock.resetMocks();
    document.cookie = ''; // מנקה את ה-Cookie
    navigateMock = require('react-router-dom').navigateMock; // ייבוא navigateMock מהמוק
    navigateMock.mockClear();
  });

  test('from logs in successfully to create new set', async () => {
    // Mock login response
    fetchMock.mockResponseOnce(
      JSON.stringify({ success: true, token: 'mocked-jwt-token' })
    );

    // Render Login component
    render(
      <Router>
        <Login />
      </Router>
    );

    // Simulate Google Login button click
    const loginButton = screen.getByText('Mock Google Login');
    fireEvent.click(loginButton);

    // Wait for token to be saved and navigation to be triggered

      // Verify token in cookies
   await waitFor(() => {
	    expect(document.cookie).toContain('token=mocked-jwt-token');

		expect(navigateMock).toHaveBeenNthCalledWith(1, '/option');
	  });
	render(
		<Router>
		  <Option />
		</Router>
	  );

  // לחיצה על הכפתור "Practice English"
  const practiceButton = screen.getByText('Practice English');
  fireEvent.click(practiceButton);

  // בדיקה שהניווט ל-/home בוצע
  await waitFor(() => {
	expect(navigateMock).toHaveBeenNthCalledWith(2, '/home');
  });

    // Mock API response for user progress in Home
    fetchMock.mockResponseOnce(
		JSON.stringify({
		  success: true,
		  sets: [],
		})
	  );
  
	  // Render Home component

	  render(
		<Router>
		  <UserSets />
		</Router>
	  );
	  // Click "Create Set" button in UserSets
	  const createSetButton = screen.getByText('Create Set');
	  expect(createSetButton).toBeInTheDocument();

	  fireEvent.click(createSetButton);
  
	  // Verify navigation to /create-set
	  await waitFor(() => {
		expect(navigateMock).toHaveBeenNthCalledWith(3, '/create-set');
	  });
  

	  // Mock API response for creating a set
	  fetchMock.mockResponseOnce(
		JSON.stringify({ success: true, message: 'Word set created successfully' })
	  );
  	  render(
		<Router>
		  <CreateSet />
		</Router>
	  );
	  // Fill in set name
	  fireEvent.change(screen.getByPlaceholderText('Enter set name'), {
		target: { value: 'My Vocabulary Set' },
	  });
  
	  // Add words to the set
	  const addWordButton = screen.getByText('Add Another Word');
	  for (let i = 0; i < 2; i++) {
		fireEvent.click(addWordButton);
	  }
  
	  const wordInputs = screen.getAllByPlaceholderText('Enter word');
	  const meaningInputs = screen.getAllByPlaceholderText('Enter meaning');
  
	  for (let i = 0; i < 3; i++) {
		fireEvent.change(wordInputs[i], { target: { value: `Word ${i}` } });
		fireEvent.change(meaningInputs[i], { target: { value: `Meaning ${i}` } });
	  }
  
	  // Submit the set
	  const saveButton = screen.getByRole('button', { name: /Save Word Set/i });
	  fireEvent.click(saveButton);
  
	  // Verify navigation to /set/My Vocabulary Set
	  await waitFor(() => {
		expect(navigateMock).toHaveBeenNthCalledWith(4, '/set/My Vocabulary Set');
	  });
  
	  // Verify API call
	  expect(fetchMock).toHaveBeenCalledWith(
		'http://localhost:3001/api/sets/create',
		expect.objectContaining({
		  method: 'POST',
		  headers: expect.objectContaining({
			'Content-Type': 'application/json',
			Authorization: 'Bearer mocked-jwt-token',
		  }),
		  body: JSON.stringify({
			setName: 'My Vocabulary Set',
			words: [
			  { word: 'Word 0', meaning: 'Meaning 0' },
			  { word: 'Word 1', meaning: 'Meaning 1' },
			  { word: 'Word 2', meaning: 'Meaning 2' },
			],
		  }),
		})
	  );
	});
  });