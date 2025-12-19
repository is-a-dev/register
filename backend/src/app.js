const express = require('express');
const cors = require('cors');
require('dotenv').config();
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        app: 'Dayly API',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/api/moods', require('./routes/moods'));
app.use('/api/sleep', require('./routes/sleep'));

// 404
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;
