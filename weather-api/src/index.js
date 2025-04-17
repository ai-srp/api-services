const express = require('express');
const app = express();
const port = 3001;

// Example endpoint
app.get('/api/example', (req, res) => {
  res.json({ message: 'Hello from the API!' });
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});