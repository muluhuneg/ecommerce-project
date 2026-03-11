const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'muluhunegnaw',
    database: 'ecommerce_db'
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        console.error('Error code:', err.code);
    } else {
        console.log('✅ Database connected successfully!');
        
        connection.query('SELECT * FROM products', (err, results) => {
            if (err) {
                console.error('❌ Query failed:', err.message);
            } else {
                console.log(`✅ Found ${results.length} products`);
                console.log('First product:', results[0]);
            }
            connection.end();
        });
    }
});