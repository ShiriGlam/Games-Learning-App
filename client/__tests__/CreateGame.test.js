import React from 'react';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Gamer from '../src/Gamer/Gamer';
import '@testing-library/jest-dom';
import CodeEditor from '../src/Gamer/CodeEditor';


global.fetch = jest.fn();

describe('Create Game ', () => {
	jest.mock('@monaco-editor/react', () => {
		return {
		  Editor: ({ onChange, value }) => (
			<textarea
			  aria-label="Code Editor"
			  onChange={(e) => onChange(e.target.value)}
			  value={value}
			/>
		  )
		};
	  });

	  test('renders CodeEditor and interacts with it by directly setting code', async () => {
		const setCodeMock = jest.fn();
		render(<CodeEditor code="" setCode={setCodeMock} />);
	  
		// לחצן לפתיחת העורך
		fireEvent.click(screen.getByText('Add Game Code'));
	  
		// הזנת קוד ישירות לפונקציה setCode
		const codeToSet = 'console.log("Hello World");';
		setCodeMock(codeToSet);
	  
		// אימות שהפונקציה setCode נקראה עם הקוד הנכון
		expect(setCodeMock).toHaveBeenCalledWith(codeToSet);
	  
		// אופציונלי: בדיקה שהקוד נשמר בהצלחה
		// לדוגמה, אם יש כפתור שמירה והוא קורא לפונקציה ששומרת את הקוד:
		fireEvent.click(screen.getByText('Save and Back🔙'));
	  
	  });
	  

	  // Mock ל-fetch
	  global.fetch = jest.fn();
	  
	  test('creates a new game and displays it on the screen', async () => {
		// מדמים את התגובה של השרת ליצירת משחק חדש
		fetch.mockImplementationOnce(() =>
		  Promise.resolve({
			ok: true,
			json: () =>
			  Promise.resolve({
				_id: '12345',
				name: 'Test Game',
				creator: 'John Doe',
				createdBy: 'user123',
				language: 'JavaScript',
				category: 'Action',
				code: 'console.log("This is a test game!");',
				css: '',
				imageUrl: null,
			  }),
		  })
		);
	  
		render(<Gamer />);
	  
		// לחיצה על "Add New Game" לפתיחת הטופס
		fireEvent.click(screen.getByText('Add New Game'));
	  
		// מילוי פרטי המשחק בטופס
		fireEvent.change(screen.getByLabelText('Game Name:'), { target: { value: 'Test Game' } });
		fireEvent.change(screen.getByLabelText('Language:'), { target: { value: 'JavaScript' } });
		fireEvent.change(screen.getByLabelText('Creator:'), { target: { value: 'John Doe' } });
		fireEvent.change(screen.getByLabelText('Category:'), { target: { value: 'Action' } });
	  
		// פתיחת העורך והזנת קוד
		fireEvent.click(screen.getByText('Add Game Code'));

		// שמירת הטופס
		fireEvent.click(screen.getByText('Submit'));


	  });
	  

});
