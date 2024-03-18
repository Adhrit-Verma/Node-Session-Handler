# Node Session Handler

Node Session Handler is a simple web application built with Node.js, Express, and PostgreSQL. It provides functionality for user authentication, session management, and storing user-specific text data in a PostgreSQL database.

## Features

- **User Authentication:** Allows users to sign up and log in securely.
- **Session Management:** Utilizes Express Session for managing user sessions.
- **Text Data Storage:** Stores and retrieves user-specific text data in the database.
- **Real-time Updates:** Updates user text data in real-time without page reload.

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/node-session-handler.git
   ```

2. **Install Dependencies:**

   ```bash
   cd node-session-handler
   npm install
   ```

3. **Set up PostgreSQL Database:**

   - Ensure PostgreSQL is installed and running on your machine.
   - Update the database configuration in `dbmanager.js` if needed (`user`, `host`, `password`, etc.).
   - Run the application to automatically create the necessary tables and database.

4. **Start the Server:**

   ```bash
   npm start
   ```

5. **Access the Application:**

   Open your web browser and navigate to [http://localhost:3000](http://localhost:3000).

## Usage

- **Signup:** Access the signup page (`/signup.html`) to create a new account.
- **Login:** Log in with your credentials on the login page (`/login.html`).
- **Edit Text:** After logging in, access the edit text page (`/edit_text.html`) to edit your custom text. Changes will be saved in real-time.

## License

This project is licensed under the [MIT License](LICENSE).
```