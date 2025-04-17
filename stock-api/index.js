const express = require('express');
const axios = require('axios'); // Import axios for HTTP requests
const app = express();
const port = 3000;

// Sample route
app.get('/api/stock', async (req, res) => {
    const { symbol } = req.query; // Get the stock symbol from query parameters

    if (!symbol) {
        return res.status(400).json({ error: 'Stock symbol is required' });
    }

    try {
        // Use Yahoo Finance's public API endpoint to fetch stock details
        const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
        const stockData = response.data;

        res.json({
            message: 'Stock details fetched successfully',
            data: stockData
        });
    } catch (error) {
        console.error('Error fetching stock details:', error);
        res.status(500).json({ error: 'Failed to fetch stock details' });
    }
});

app.listen(port, () => {
    console.log(`Stock API server is running on http://localhost:${port}`);
});