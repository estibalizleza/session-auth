const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const User = require('./models/user');

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect('mongodb://localhost/auth_demo', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Successfully connected to MongoDB.');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost/auth_demo',
        ttl: 24 * 60 * 60 // 1 day
    })
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
        
        if (!username || !password) {
            console.log('Missing username or password');
            return res.status(400).send('Username and password are required');
        }

        // Check if user exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log('Username already exists:', username);
            return res.status(400).send('Username already exists');
        }

        // Create new user
        const user = new User({ username, password });
        try {
            await user.save();
            console.log('User registered successfully:', username);
            res.redirect('/');
        } catch (saveError) {
            console.error('Error saving user:', saveError);
            res.status(500).send('Error saving user');
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).send('Error registering user');
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).send('User not found');
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).send('Invalid password');
        }

        // Set session
        req.session.user = username;
        res.redirect('/dashboard');
    } catch (error) {
        res.status(500).send('Error logging in');
    }
});

// Dashboard route (protected)
app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
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
