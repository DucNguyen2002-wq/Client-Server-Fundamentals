const express = require('express');
const path = require('path');
const os = require('os');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom headers middleware
app.use((req, res, next) => {
    res.header('X-Powered-By', 'Lab01-Server');
    res.header('X-Server-Time', new Date().toISOString());
    res.header('X-Node-Version', process.version);
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url} - ${req.ip}`);
    next();
});

// Server start time for uptime calculation
const serverStartTime = Date.now();

// Routes

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API: Server information
app.get('/api/server-info', (req, res) => {
    const uptime = Math.floor((Date.now() - serverStartTime) / 1000);
    
    const serverInfo = {
        timestamp: new Date().toISOString(),
        server: 'Express.js',
        version: '1.0.0',
        uptime: uptime,
        platform: os.platform(),
        architecture: os.arch(),
        nodeVersion: process.version,
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        cpus: os.cpus().length,
        hostname: os.hostname(),
        networkInterfaces: Object.keys(os.networkInterfaces())
    };
    
    res.json(serverInfo);
});

// API: Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: Math.floor((Date.now() - serverStartTime) / 1000)
    });
});

// API: Echo endpoint for testing POST requests
app.post('/api/echo', (req, res) => {
    res.json({
        message: 'Echo successful',
        timestamp: new Date().toISOString(),
        receivedData: req.body,
        headers: req.headers,
        method: req.method,
        url: req.url
    });
});

// API: Get current time
app.get('/api/time', (req, res) => {
    const now = new Date();
    res.json({
        timestamp: now.toISOString(),
        unix: now.getTime(),
        formatted: now.toLocaleString('vi-VN'),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
});

// Error handling middleware for 404
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `The requested resource ${req.originalUrl} was not found on this server.`,
        timestamp: new Date().toISOString(),
        statusCode: 404
    });
});

// Global error handler for 500
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: 'Something went wrong on the server.',
        timestamp: new Date().toISOString(),
        statusCode: 500
    });
});

// Start server
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🚀 LAB01 - CLIENT-SERVER FUNDAMENTALS');
    console.log('='.repeat(50));
    console.log(`📡 Server running on: http://localhost:${PORT}`);
    console.log(`📅 Started at: ${new Date().toLocaleString('vi-VN')}`);
    console.log(`🖥️  Platform: ${os.platform()} ${os.arch()}`);
    console.log(`⚡ Node.js: ${process.version}`);
    console.log(`💾 Memory: ${Math.round(os.totalmem() / 1024 / 1024)} MB total`);
    console.log('='.repeat(50));
    console.log('📋 Available endpoints:');
    console.log('   GET  /                  - Home page');
    console.log('   GET  /api/server-info   - Server information');
    console.log('   GET  /api/health        - Health check');
    console.log('   GET  /api/time          - Current time');
    console.log('   POST /api/echo          - Echo test');
    console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n📴 Shutting down server gracefully...');
    process.exit(0);
});

module.exports = app;
