const { DataSource } = require('typeorm');

async function migrate() {
    const sourceDs = new DataSource({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: '',
        database: 'droguerie_db'
    });

    const targetDs = new DataSource({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: '',
        database: 'animal2'
    });

    try {
        await sourceDs.initialize();
        await targetDs.initialize();

        console.log('Disabling foreign key checks in target...');
        await targetDs.query('SET FOREIGN_KEY_CHECKS = 0');

        console.log('Fetching tables from droguerie_db...');
        const tables = await sourceDs.query('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);

        for (const table of tableNames) {
            console.log(`Migrating table: ${table}`);
            
            // Get create table statement
            const createRes = await sourceDs.query(`SHOW CREATE TABLE \`${table}\``);
            const createSql = createRes[0]['Create Table'];
            
            // Drop table in target if exists
            await targetDs.query(`DROP TABLE IF EXISTS \`${table}\``);
            
            // Create table in target
            await targetDs.query(createSql);
            
            // Copy data
            await targetDs.query(`INSERT INTO \`animal2\`.\`${table}\` SELECT * FROM \`droguerie_db\`.\`${table}\``);
            
            console.log(`Successfully migrated ${table}`);
        }

        console.log('Enabling foreign key checks in target...');
        await targetDs.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('Migration completed successfully!');
        
        await sourceDs.destroy();
        await targetDs.destroy();
    } catch (error) {
        console.error('Migration failed:', error);
        // Try to re-enable checks if failed
        try { await targetDs.query('SET FOREIGN_KEY_CHECKS = 1'); } catch(e) {}
        process.exit(1);
    }
}

migrate();
