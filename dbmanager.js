const { Pool } = require('pg');

// Configuration for connecting to the PostgreSQL database
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'users',
    password: 'root',
    port: 5432,
});

// Function to create the users table
async function createUsersTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            session_id VARCHAR(255),
            text_data TEXT
        );
    `;

    try {
        const result = await pool.query(query);
        console.log('Users table created successfully');
    } catch (error) {
        console.error('Error creating users table:', error);
    }
}

// Connect to the database and create the users table
pool.connect((err, client, done) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
    createUsersTable(); // Create the users table

    // Release the client back to the pool
    done();
});

// Function to update user text data in real-time
async function updateUserText(email, text) {
    const query = `
        UPDATE users
        SET text_data = $1
        WHERE email = $2
    `;

    try {
        await pool.query(query, [text, email]);
        console.log('User text data updated successfully');
    } catch (error) {
        console.error('Error updating user text data:', error);
    }
}

// Function to retrieve user text data
async function getUserText(email) {
    const query = `
        SELECT text_data
        FROM users
        WHERE email = $1
    `;

    try {
        const result = await pool.query(query, [email]);
        return result.rows[0].text_data || '';
    } catch (error) {
        console.error('Error retrieving user text data:', error);
        return '';
    }
}

module.exports = {
    updateUserText,
    getUserText
};
