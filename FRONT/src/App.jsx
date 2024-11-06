import React, { useState } from 'react';
import FileUpload from './components/FileUpdate';
import './App.css';

function App() {
  const [fileContent, setFileContent] = useState([]);

  const handleFileContent = (content) => {
    setFileContent(content);
    console.log('File content:', content); // For debugging
  };

  return (
    <div className="App">
      <h1>Análisis sintáctico descendente</h1>
      <FileUpload onFileContent={handleFileContent} />
      <div>
        <h2>Contenido de la gramática:</h2>
        <pre>{fileContent.join('\n')}</pre>
      </div>
    </div>
  );
}

export default App;
