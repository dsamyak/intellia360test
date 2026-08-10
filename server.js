// 1. Load hidden environment variables
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 2. Configure Express middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Fetch connection string from .env (DATABASE_URL per system architecture or MONGO_URI)
const mongoURI = process.env.DATABASE_URL || process.env.MONGO_URI;

if (!mongoURI) {
    console.error('❌ Error: Neither DATABASE_URL nor MONGO_URI is defined in .env');
    process.exit(1);
}

// 4. API Endpoints
// Health check endpoint
app.get('/api/health', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    
    res.status(200).json({
        status: 'ok',
        message: 'Intellia360 API Liveness Check',
        timestamp: new Date().toISOString(),
        database: {
            state: states[dbState] || 'unknown',
            isConnected: dbState === 1
        }
    });
});

// Root route
app.get('/', (req, res) => {
    res.status(200).json({
        name: 'Intellia360 Backend API',
        version: '1.0.0',
        status: 'online',
        healthCheck: '/api/health'
    });
});

// 5. Mongoose Event Listeners
mongoose.connection.on('connected', () => {
    console.log('✅ Successfully connected to MongoDB!');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB connection lost.');
});

// 6. MongoDB Connection Function with Auto-Retry
let isConnecting = false;

async function connectToDatabase() {
    if (isConnecting || mongoose.connection.readyState === 1) return;
    isConnecting = true;

    try {
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000 // Quick timeout to prevent hanging
        });
    } catch (error) {
        console.error('\n' + '='.repeat(70));
        console.error('❌ DATABASE CONNECTION FAILED:', error.message);
        console.error('='.repeat(70));
        
        if (error.message.includes('Could not connect to any servers') || error.message.includes('whitelist')) {
            console.error('👉 HOW TO FIX THIS MONGODB ATLAS ISSUE:');
            console.error('   1. Log into your MongoDB Atlas Console: https://cloud.mongodb.com');
            console.error('   2. Select your project & cluster.');
            console.error('   3. In the left sidebar, click "Network Access" under Security.');
            console.error('   4. Click "+ Add IP Address".');
            console.error('   5. Click "ALLOW ACCESS FROM ANYWHERE" (adds 0.0.0.0/0) or "ADD CURRENT IP ADDRESS".');
            console.error('   6. Save and wait 1-2 minutes for Atlas to update access rules.');
        }
        console.error('='.repeat(70));
        console.error('🔄 Retrying database connection in 10 seconds...\n');
        
        // Schedule auto-retry
        setTimeout(() => {
            isConnecting = false;
            connectToDatabase();
        }, 10000);
    } finally {
        isConnecting = false;
    }
}

// 7. Start HTTP Server & Initialize DB Connection
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Intellia360 Server is running on port ${PORT}`);
    console.log(`📡 Health check available at: http://localhost:${PORT}/api/health`);
    console.log('🔗 Connecting to MongoDB database...');
    
    // Initiate non-blocking DB connection
    connectToDatabase();
});

// 8. Graceful Shutdown Signal Handling
const gracefulShutdown = (signal) => {
    console.log(`\n⚠️ Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
        console.log('🔒 HTTP server closed.');
        if (mongoose.connection.readyState !== 0) {
            mongoose.connection.close(false, () => {
                console.log('🔒 MongoDB connection closed.');
                process.exit(0);
            });
        } else {
            process.exit(0);
        }
    });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

