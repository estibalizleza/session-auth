const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 3000;

// In-memory user storage (replace with a database in production)
const users = [];

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Serve login page
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// Serve register page
app.get('/register', (req, res) => {
    res.redirect('/register.html');
});

// Register endpoint
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Check if user already exists
        if (users.find(user => user.username === username)) {
            return res.status(400).send('Username already exists');
        }

        //formato correcto de correo

        //repetir contraseña(confirmar que son iguales)

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Store user
        users.push({
            username,
            password: hashedPassword
        });

        res.redirect('/');
    } catch (error) {
        res.status(500).send('Error registering user');
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find user
        const user = users.find(user => user.username === username);
        
        if (!user) {
            return res.status(400).send('User not found');
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(400).send('Invalid password');
        }

        // Set session
        req.session.user = username; //cookie -->  username gorde
        res.redirect('/dashboard');
    } catch (error) {
        res.status(500).send('Error logging in');
    }
});

// Dashboard route (protected)
app.get('/dashboard', (req, res) => {
    if (!req.session.user) { //sessio.user balia bat dauka?
        return res.redirect('/');
    }
    res.send(`Welcome ${req.session.user}! You are now logged in.`);
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
