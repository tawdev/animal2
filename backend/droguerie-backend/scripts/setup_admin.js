const { DataSource } = require('typeorm');
const bcrypt = require('bcrypt');

const ds = new DataSource({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '',
    database: 'droguerie_db',
    entities: []
});

async function setup() {
    try {
        await ds.initialize();
        
        const email = 'admin@petmarket.ma';
        const password = 'admin2026';
        const fullName = 'PetMarket Admin';
        const role = 'admin';
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Check if user exists
        const existing = await ds.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (existing.length > 0) {
            await ds.query('UPDATE users SET password = ?, full_name = ?, role = ? WHERE email = ?', [hashedPassword, fullName, role, email]);
            console.log(`User ${email} updated successfully.`);
        } else {
            await ds.query('INSERT INTO users (email, password, full_name, role, isActive) VALUES (?, ?, ?, ?, 1)', [email, hashedPassword, fullName, role]);
            console.log(`User ${email} created successfully.`);
        }
        
        console.log('-----------------------------------');
        console.log('Login Details:');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log('-----------------------------------');
        
        await ds.destroy();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

setup();
