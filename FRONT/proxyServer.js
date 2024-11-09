import express from 'express';
import cors from 'cors';
import axios from 'axios';

// Create an instance of an Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Use CORS to allow cross-origin requests
app.use(cors());
app.use(express.json());

// Define a POST route that forwards the request to the external API
app.post('/proxy', async (req, res) => {
  try {
    // Forward the incoming request body to the external API
    const response = await axios.post('https://compiapi.onrender.com/execute', req.body);
    
    // Send the response back to the client
    res.json(response.data);
  } catch (error) {
    console.error('Error in proxy:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
