import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Login from '../src/Login/Login';
import dotenv from 'dotenv';
import React from 'react';

dotenv.config(); // טוען את משתני הסביבה מקובץ .env

jest.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }) => <div>{children}</div>,
  GoogleLogin: ({ onSuccess }) => (
    <button onClick={() => onSuccess({ credential: 'mocked-jwt-token' })}>
      Mock Google Login
    </button>
  ),
}));
test('logs in successfully with mocked Google Login', async () => {
	// Mock login response
	fetch.mockResponseOnce(
	  JSON.stringify({ success: true, token: 'mocked-jwt-token' })
	);
  
	// Render Login component
	render(
	  <Router>
		<Login />
	  </Router>
	);
  
	// Simulate login
	const loginButton = screen.getByText('Mock Google Login');
	fireEvent.click(loginButton);
  
	// Wait for token to be saved
	await waitFor(() => {
	  expect(document.cookie).toContain('token=mocked-jwt-token');
	});
  
	console.log('Cookies:', document.cookie);
  });
  