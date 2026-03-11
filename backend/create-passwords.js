const bcrypt = require('bcryptjs');

async function generateHashes() {
    const passwords = [
        { role: 'admin', password: 'admin123' },
        { role: 'seller', password: 'seller123' },
        { role: 'customer', password: 'customer123' }
    ];

    console.log('Generating password hashes...\n');
    
    for (const item of passwords) {
        const hash = await bcrypt.hash(item.password, 10);
        console.log(`${item.role} password: ${item.password}`);
        console.log(`Hashed: ${hash}\n`);
    }
}

generateHashes();