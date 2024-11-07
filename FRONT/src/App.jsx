import React, { useState } from 'react';
import FileUpload from './components/FileUpdate';
import './App.css';
import { read_grammar } from '/src/assets/sa_pipeline.js'; // Importing only what you need

function App() {
  const [fileContent, setFileContent] = useState([]);
  const [parsedGrammar, setParsedGrammar] = useState(null);

  const handleFileContent = (content) => {
    console.log('File content:', content); // For debugging

    // Check if content is a string and split it if necessary
    const lines = typeof content === 'string' ? content.split('\n') : content;
    setFileContent(lines);

    // Use `read_grammar` with the lines array to parse grammar
    const grammar = read_grammar(lines);
    setParsedGrammar(grammar);
  };

  return (
    <div className="app-container">
      <h1>Análisis sintáctico descendente</h1>
      <div className="button">
        <FileUpload onFileContent={handleFileContent} />
      </div>

      <div className="section">
        <h2 className="section-title">Gramática:</h2>
        {parsedGrammar ? (
          <ul>
            {Object.keys(parsedGrammar).map((nonTerminal) => (
              <li key={nonTerminal}>
                <strong>{nonTerminal}:</strong> {parsedGrammar[nonTerminal].join(' | ')}
              </li>
            ))}
          </ul>
        ) : (
          <p>No grammar loaded</p>
        )}
      </div>
    </div>
  );
}

export default App;
