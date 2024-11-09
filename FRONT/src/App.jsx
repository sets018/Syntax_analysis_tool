import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import Firsts from './components/Firsts';
import Nexts from './components/Nexts';
import AnalysisTable from './components/AnalysisTable';
import Trace from './components/Traces';
import FactorizedGrammar from './components/FactorizedGrammar'; // Import the new component
import axios from 'axios';
import './App.css';

function App() {
  const [fileContent, setFileContent] = useState('');
  const [apiResponse, setApiResponse] = useState(null);
  const [chain, setChain] = useState('');
  const [traceResponse, setTraceResponse] = useState(null);

  const handleFileContent = async (content) => {
    setFileContent(content);
    console.log('File content:', content); // Debugging

    // URL for your local proxy server for grammar analysis
    const proxyServerUrl = 'http://localhost:5000/proxy/grammar';

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

  const handleChainRecognition = async () => {
    if (!fileContent || !chain) {
      alert('Please upload grammar and enter a chain to recognize.');
      return;
    }

    // URL for your local proxy server for chain recognition
    const proxyRecognizeUrl = 'http://localhost:5000/proxy/recognize';

    try {
      const response = await axios.post(proxyRecognizeUrl, {
        text: fileContent,
        string: chain,
      });
      setTraceResponse(response.data);
      console.log('Trace response:', response.data); // Debugging
    } catch (error) {
      console.error('Error calling the recognition API:', error);
    }
  };

  return (
    <div className="app-container">
      <h1 className="title">Grammar Analysis Tool</h1>
      <FileUpload onFileContent={handleFileContent} />

      <div className="chain-input-container">
        <input
          type="text"
          placeholder="Enter chain to recognize"
          value={chain}
          onChange={(e) => setChain(e.target.value)}
        />
        <button onClick={handleChainRecognition}>Recognize Chain</button>
      </div>

      {apiResponse && (
        <div className="response-container">
          <div className="grammar-container">
            <h2>Firsts</h2>
            <Firsts data={apiResponse.primeros} />
            <h2>Nexts</h2>
            <Nexts data={apiResponse.siguientes} />
            <h2>Factorized Grammar</h2>
            <FactorizedGrammar data={apiResponse.text} /> {/* Display the factorized grammar */}
          </div>
          <div className="table-container">
            <AnalysisTable data={apiResponse.result.tabla_m} />
          </div>
        </div>
      )}

      {traceResponse && traceResponse.result && traceResponse.result.trace && (
        <div className="trace-container">
          <h2>Trace</h2>
          <Trace data={traceResponse.result.trace} />
          <p>
            Recognized: {traceResponse.result.recognized ? 'Yes' : 'No'}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
