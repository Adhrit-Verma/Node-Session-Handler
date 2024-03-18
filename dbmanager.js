const { Pool } = require('pg');

// Configuration for connecting to the PostgreSQL database
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres', // Connect to default 'postgres' database for administrative purposes
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

// Function to create the users database if it doesn't exist
async function createDatabaseIfNotExists() {
    const query = `
        CREATE DATABASE IF NOT EXISTS users;
    `;

    try {
        await pool.query(query);
        console.log('Database created successfully or already exists');
    } catch (error) {
        console.error('Error creating database:', error);
    }
}

// Connect to the database and create the users database and table if not exists
pool.connect(async (err, client, done) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
    createDatabaseIfNotExists(); // Create the users database if it doesn't exist
    createUsersTable(); // Create the users table

    // Release the client back to the pool
    done();
});

// Handle errors
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client:', err);
    process.exit(-1);
});

module.exports = {
    createUsersTable
};