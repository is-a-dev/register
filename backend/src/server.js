const app = require('./app');
const pool = require('./config/database');

const PORT = process.env.PORT || 5000;
const authRoutes = require('./routes/auth');

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ DB failed:', err.message);
    } else {
        console.log('✅ DB connected:', res.rows.now);
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 DAYLY API running on port ${PORT}\n`);
});

process.on('SIGINT', () => {
    console.log('\n⏹️ Shutting down...');
    pool.end();
    process.exit(0);
});

app.use('/api/auth', authRoutes);