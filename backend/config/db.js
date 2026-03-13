const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'muluhunegnaw',
    database: process.env.DB_NAME || 'ecommerce_db',
    // 1. ADDED PORT (Important: uses your 25876 port)
    port: process.env.DB_PORT || 3306, 
    // 2. ADDED SSL (Important: Required for Aiven)
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // 3. ADDED TIMEOUT SETTINGS to prevent ETIMEDOUT
    connectTimeout: 10000 
});

const promisePool = pool.promise();

module.exports = promisePool;