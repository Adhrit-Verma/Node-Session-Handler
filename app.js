// app.js

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');

// Create Express app
const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Login route - handle POST requests
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  // Here you can implement your login logic
  // For demonstration, we'll just log the credentials
  console.log('Email:', email);
  console.log('Password:', password);
  // You can send a response back to the client indicating success or failure
  res.json({ message: 'Login request received' });
});

// Serve the HTML file
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
