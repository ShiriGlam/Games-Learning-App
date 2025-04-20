import React, { useState, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import * as esprima from 'esprima';
import './CodeEditor.css';

const CodeEditor = ({ code, setCode }) => {
  const editorRef = useRef(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditorChange = (value) => {
    setCode(value);
    validateCode(value);
  };

  const validateCode = (value) => {
    try {
      esprima.parseModule(value, { jsx: true }); // בדיקת סינטקס כולל JSX
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (error) {
      alert(`Your Code Have Syntax Error. Syntax error: ${error}`);
    } else {
      alert('Code saved successfully!');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="code-editor-container">
      <button 
      type="button" 
      onClick={() => setIsModalOpen(true)} className="open-editor-button">
        Add Game Code
      </button>

      {isModalOpen && (
        <div className="modal-overlay-editor">
          <div className="modal-content-editor">
            <button
          onClick={(e) => {
          handleSave(e);
          }}
            >
              Save and Back🔙
            </button>
            <Editor
              height="400px"
              defaultLanguage="javascript"
              value={code}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                tabSize: 2,
                formatOnType: true,
                wordWrap: 'on',
                minimap: { enabled: false },
              }}
            />
            {error && <div className="error-message">Syntax Error: {error}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;