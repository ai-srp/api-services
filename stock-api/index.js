const express = require('express');
const axios = require('axios'); // Import axios for HTTP requests
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const app = express();
const port = 3000;

// Enhanced Swagger configuration and documentation to adhere to OpenAPI standards
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Stock API',
            version: '1.0.0',
            description: 'API for fetching stock details, symbols, and prices',
            contact: {
                name: 'API Support',
                email: 'support@example.com',
            },
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Local server',
            },
        ],
        components: {
            schemas: {
                StockDetails: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                        },
                        data: {
                            type: 'object',
                        },
                    },
                },
                StockSymbol: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                        },
                        symbol: {
                            type: 'string',
                        },
                    },
                },
                StockPrice: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                        },
                        price: {
                            type: 'number',
                        },
                    },
                },
            },
        },
    },
    apis: [__filename],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Add a direct link to the OpenAPI document in the Swagger UI
app.get('/openapi.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocs);
});

// Update Swagger UI setup to include a link to the OpenAPI document
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Stock API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
        urls: [
            { url: '/openapi.json', name: 'OpenAPI Document' }
        ]
    }
}));

/**
 * @swagger
 * /api/stock:
 *   get:
 *     summary: Get stock details by symbol
 *     parameters:
 *       - in: query
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock symbol
 *     responses:
 *       200:
 *         description: Stock details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StockDetails'
 *       400:
 *         description: Stock symbol is required
 *       500:
 *         description: Failed to fetch stock details
 */
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

/**
 * @swagger
 * /api/stock/symbol:
 *   get:
 *     summary: Get stock symbol by company name
 *     parameters:
 *       - in: query
 *         name: companyName
 *         required: true
 *         schema:
 *           type: string
 *         description: Company name
 *     responses:
 *       200:
 *         description: Stock symbol fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StockSymbol'
 *       400:
 *         description: Company name is required
 *       404:
 *         description: No matching stock symbol found
 *       500:
 *         description: Failed to fetch stock symbol
 */
app.get('/api/stock/symbol', async (req, res) => {
    const { companyName } = req.query; // Get the company name from query parameters

    if (!companyName) {
        return res.status(400).json({ error: 'Company name is required' });
    }

    try {
        // Use Yahoo Finance's public API or another service to fetch the stock symbol
        const response = await axios.get(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(companyName)}`);
        const searchData = response.data;

        if (searchData.quotes && searchData.quotes.length > 0) {
            const symbol = searchData.quotes[0].symbol; // Get the first matching symbol

            res.json({
                message: 'Stock symbol fetched successfully',
                symbol: symbol
            });
        } else {
            res.status(404).json({ error: 'No matching stock symbol found' });
        }
    } catch (error) {
        console.error('Error fetching stock symbol:', error);
        res.status(500).json({ error: 'Failed to fetch stock symbol' });
    }
});

/**
 * @swagger
 * /api/stock/price:
 *   get:
 *     summary: Get current stock price by symbol
 *     parameters:
 *       - in: query
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock symbol
 *     responses:
 *       200:
 *         description: Current stock price fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StockPrice'
 *       400:
 *         description: Stock symbol is required
 *       404:
 *         description: No stock data found
 *       500:
 *         description: Failed to fetch stock price
 */
app.get('/api/stock/price', async (req, res) => {
    const { symbol } = req.query; // Get the stock symbol from query parameters

    if (!symbol) {
        return res.status(400).json({ error: 'Stock symbol is required' });
    }

    try {
        // Use Yahoo Finance's public API endpoint to fetch stock details
        const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
        const stockData = response.data;

        if (stockData.chart && stockData.chart.result && stockData.chart.result.length > 0) {
            const currentPrice = stockData.chart.result[0].meta.regularMarketPrice; // Extract the current price

            res.json({
                message: 'Current stock price fetched successfully',
                price: currentPrice
            });
        } else {
            res.status(404).json({ error: 'No stock data found' });
        }
    } catch (error) {
        console.error('Error fetching stock price:', error);
        res.status(500).json({ error: 'Failed to fetch stock price' });
    }
});

app.listen(port, () => {
    console.log(`Stock API server is running on http://localhost:${port}`);
});
