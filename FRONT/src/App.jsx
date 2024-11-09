import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import Firsts from './components/Firsts';
import Nexts from './components/Nexts'; // Import the Nexts component
import AnalysisTable from './components/AnalysisTable'; // Import the AnalysisTable component
import axios from 'axios';
import './App.css';

function App() {
  const [fileContent, setFileContent] = useState('');
  const [apiResponse, setApiResponse] = useState(null);

  const handleFileContent = async (content) => {
    setFileContent(content);
    console.log('File content:', content); // Debugging

    // URL for your local proxy server
    const proxyServerUrl = 'http://localhost:5000/proxy';

    // Send file content to the proxy server, which forwards to the external API
    try {
      const response = await axios.post(proxyServerUrl, {
        text: content,
      });
      setApiResponse(response.data);
      console.log('API response:', response.data); // Debugging
    } catch (error) {
      console.error('Error calling the API:', error);
    }
  };

  return (
    <div className="app-container">
      <h1 className="title">Grammar Analysis Tool</h1>
      <FileUpload onFileContent={handleFileContent} />

      {apiResponse && (
        <div className="response-container">
          <div className="grammar-container">
          <h2>Firsts</h2>
          <Firsts data={apiResponse.primeros} />
          <h2>Nexts</h2>
          <Nexts data={apiResponse.siguientes} /> {/* Render the Nexts component */}
          </div>
          <div className="table-container">
            <AnalysisTable data={apiResponse.result.tabla_m} /> {/* Use the correct path */}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
