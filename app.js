const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();

const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Express session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Initialize SQLite database
const db = new sqlite3.Database('./users.db');

// Create users table if not exists
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, password TEXT, session_id TEXT, text_data TEXT)");
});

// Login route - handle POST requests
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Log user entries
  console.log('User login attempt:', email);

  // Check if user exists in the database
  db.get("SELECT * FROM users WHERE email = ?", email, (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (!row || row.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate a session ID and store it in the session
    req.session.userId = email;
    // Generate a session ID and store it in the database
    const sessionId = req.session.id;
    db.run("UPDATE users SET session_id = ? WHERE email = ?", [sessionId, email]);

    res.json({ message: 'Login successful' });
  });
});

// Route to access user-specific page
app.get('/user', (req, res) => {
  const userEmail = req.session.userId;
  if (!userEmail) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Fetch user-specific text data from the database based on the session ID
  db.get("SELECT text_data FROM users WHERE email = ?", userEmail, (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (!row || !row.text_data) {
      return res.status(404).json({ error: 'User-specific data not found' });
    }

    res.json({ userText: row.text_data });
  });
});

// Route to update user-specific text data
app.post('/update-text', (req, res) => {
  const userEmail = req.session.userId;
  const newText = req.body.text;

  if (!userEmail) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Update user-specific text data in the database
  db.run("UPDATE users SET text_data = ? WHERE email = ?", [newText, userEmail], (err) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    res.json({ message: 'Text updated successfully' });
  });
});

// Serve the HTML file
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

// Serve the text editing page
app.get('/edit-text', (req, res) => {
  res.sendFile(__dirname + '/edit_text.html');
});

// Redirect home page to login
app.get('/', (req, res) => {
  res.redirect('/login');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
