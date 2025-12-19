// Allow self-signed certificates for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ⬇️ thêm hai dòng này
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
// ⬆️ phải đặt TRƯỚC mọi middleware 404 hoặc app.use('*', ...)

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', app: 'Dayly API' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 DAYLY API running on port ${PORT}`);
});
