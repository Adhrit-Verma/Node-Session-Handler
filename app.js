const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const { Client } = require('pg');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'a61872c43c5402b2db073f67f9290330e47ab64b5a6061255d690a5691bd49c7',
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

    req.session.userId = user.email;
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
    const result = await client.query('INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *', [email, password]);
    const newUser = result.rows[0];

    if (!newUser) {
      return res.status(500).json({ error: 'Failed to create user' });
    }

    req.session.userId = newUser.email;
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
    const result = await client.query('SELECT text_data FROM users WHERE email = $1', [userId]);
    const userText = result.rows[0].text_data || '';
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
    await client.query('UPDATE users SET text_data = $1 WHERE email = $2', [text, userId]);
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
