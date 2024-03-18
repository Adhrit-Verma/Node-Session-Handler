const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const generateSecretKey = require('./generateSecretKey');


const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: generateSecretKey(), resave: false, saveUninitialized: true }));

// Initialize SQLite database
const db = new sqlite3.Database('./users.db');
db.run("CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, password TEXT, session_id TEXT, text_data TEXT)");

// Login route - handle POST requests
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", email, (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (!row || row.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.userId = email;
    db.run("UPDATE users SET session_id = ? WHERE email = ?", [req.session.id, email]);
    
    res.json({ message: 'Login successful' });
  });
});

// Route to access user-specific page
app.get('/user', (req, res) => {
  const userEmail = req.session.userId;
  if (!userEmail) return res.status(401).json({ error: 'Unauthorized' });

  db.get("SELECT text_data FROM users WHERE email = ?", userEmail, (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (!row || !row.text_data) return res.status(404).json({ error: 'User-specific data not found' });

    res.json({ userText: row.text_data });
  });
});

// Route to update user-specific text data
app.post('/update-text', (req, res) => {
  const userEmail = req.session.userId;
  const newText = req.body.text;

  if (!userEmail) return res.status(401).json({ error: 'Unauthorized' });

  db.run("UPDATE users SET text_data = ? WHERE email = ?", [newText, userEmail], (err) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    res.json({ message: 'Text updated successfully' });
  });
});

// Serve static files
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
