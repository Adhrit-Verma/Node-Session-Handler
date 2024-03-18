const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid'); // Import UUID generator
const db = require('./dbmanager'); // Import the database manager module

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'a61872c43c5402b2db073f67f9290330e47ab64b5a606125',
  resave: false,
  saveUninitialized: true
}));

// PostgreSQL database connection
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'users',
  password: 'root',
  port: 5432,
});
client.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(err => console.error('Error connecting to PostgreSQL database:', err.stack));

// Login route - handle POST requests
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Set session variables
    req.session.userId = user.email;
    req.session.sessionId = req.sessionID; // Store the session ID

    return res.redirect('/edit_text.html'); // Redirect to edit_text.html after successful login
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Sign up route - handle POST requests
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Generate a unique session key using UUID
    const sessionId = uuidv4();

    const result = await client.query('INSERT INTO users (email, password, session_id) VALUES ($1, $2, $3) RETURNING *', [email, password, sessionId]);
    const newUser = result.rows[0];

    if (!newUser) {
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Set session variables
    req.session.userId = newUser.email;
    req.session.sessionId = sessionId; // Store the session ID

    return res.json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to fetch user-specific text data
app.get('/user/text', async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const userText = await db.getUserText(userId); // Use the database manager to fetch user text
    return res.json({ userText });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to update user-specific text data
app.post('/user/text', async (req, res) => {
  const userId = req.session.userId;
  const { text } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await db.updateUserText(userId, text); // Use the database manager to update user text
    return res.json({ message: 'Text data updated successfully' });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Redirect home page to login
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
