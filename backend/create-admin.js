const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function createAdmin() {
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Hashed password:', hashedPassword);
    
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'muluhunegnaw',
        database: 'ecommerce_db'
    });
    
    await connection.execute(
        'INSERT INTO users (name, email, password, role, is_verified) VALUES (?, ?, ?, ?, ?)',
        ['Admin User', 'admin@test.com', hashedPassword, 'admin', true]
    );
    
    console.log('Admin user created successfully');
    await connection.end();
}

createAdmin();