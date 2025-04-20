import React, { useState } from 'react';
import { Editor } from '@monaco-editor/react';
import './CssEditor.css';

const CssEditor = ({ cssCode, setCssCode }) => {
  const [iscssModalOpen, setIscssModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const validateCSS = (css) => {
    try {

  
      // פיצול הכללים לפי סוגריים מסולסלים
      const rules = css.split("}").map(rule => rule.trim() + "}").filter(rule => rule.trim() !== "}");
  
      const styleSheet = new CSSStyleSheet();
  
      // בדיקת כל כלל בנפרד
      for (const rule of rules) {
        try {
          styleSheet.insertRule(rule);
        } catch (e) {
          console.error(`Invalid CSS rule: ${rule}`, e.message);
          return `Invalid CSS rule: ${rule}`;
        }
      }
  
      return null; // כל הכללים תקינים
    } catch (e) {
      return e.message; // שגיאה במקרה של בעיה כללית
    }
  };

  const handleEditorChange = (value) => {
    setCssCode(value);

    // בדיקת סינטקס
    const validationError = validateCSS(value);
    if (validationError) {
      setError(validationError);
    } else {
      setError(null);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (error) {
      alert(`Your CSS Has Syntax Error: ${error}`);
    } else {
      alert('CSS saved successfully!');
      setIscssModalOpen(false);
    }
  };

  return (
    <div className="css-editor-container">
  <button
    type="button"
    onClick={() => setIscssModalOpen(true)}
    className="open-css-editor-button"
  >
    🎨🖌️
  </button>

      {iscssModalOpen && (
        <div className="modal-overlay-editor">
          <div className="modal-content-editor">
            <button
              className="close-button-editor"
              onClick={(e) => {
                handleSave(e);
              }}
            >
              Save and Back🔙
            </button>
            <Editor
              height="400px"
              defaultLanguage="css"
              value={cssCode}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                tabSize: 2,
                formatOnType: true,
                wordWrap: 'on',
                minimap: { enabled: false },
                validate: true,
              }}
            />
            {error && <div className="error-message">Syntax Error: {error}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default CssEditor;
