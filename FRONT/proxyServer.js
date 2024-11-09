import express from 'express';
import cors from 'cors';
import axios from 'axios';

// Create an instance of an Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Use CORS to allow cross-origin requests
app.use(cors());
app.use(express.json());

// Define a POST route for the grammar analysis API
app.post('/proxy/grammar', async (req, res) => {
  try {
    // Forward the incoming request body to the grammar analysis API
    const response = await axios.post('https://compiapi.onrender.com/execute', req.body);
    
    // Send the response back to the client
    res.json(response.data);
  } catch (error) {
    console.error('Error in proxy (grammar):', error);
    res.status(500).json({ error: error.message });
  }
});

// Define a POST route for the chain recognition API
app.post('/proxy/recognize', async (req, res) => {
  try {
    // Forward the incoming request body to the chain recognition API
    const response = await axios.post('https://compiapi.onrender.com/recognize', req.body);
    
    // Send the response back to the client
    res.json(response.data);
  } catch (error) {
    console.error('Error in proxy (recognize):', error);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
