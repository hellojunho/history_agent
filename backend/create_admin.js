const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function createAdmin() {
    const client = new Client({
        host: 'localhost',
        port: 55500,
        user: 'user',
        password: 'password',
        database: 'hanneunggeom'
    });

    try {
        await client.connect();
        const hash = await bcrypt.hash('admin', 10);
        const query = `
            INSERT INTO users (id, email, password_hash, role)
            VALUES (gen_random_uuid(), 'admin@admin.com', $1, 'admin')
            ON CONFLICT (email)
            DO UPDATE SET password_hash = $1, role = 'admin';
        `;
        await client.query(query, [hash]);
        console.log('✅ Admin account (admin@admin.com / admin) created successfully.');
    } catch (err) {
        console.error('❌ Error creating admin account:', err);
    } finally {
        await client.end();
    }
}

createAdmin();
