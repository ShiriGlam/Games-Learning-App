const express = require('express');
const app = express();
const mongoose = require('mongoose');
const routes = require('./routes');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const customEnv = require('custom-env');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/userModel');  
const { OAuth2Client } = require('google-auth-library');

// Body Parser
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json());
require('dotenv').config({ path: path.resolve(__dirname, './config/.env') });


customEnv.env(process.env.NODE_ENV, './config');

// CORS setup
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));


// Google token verification API (POST route for login via Google)
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
app.post('/api/users/google-login', async (req, res) => {
  const { token } = req.body;
  
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { name, email, sub: googleId } = ticket.getPayload();

    let user = await User.findOne({ googleId });
    if (!user) {
      user = new User({ username: name, email, googleId });
      await user.save();
    }

    const appToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ success: true, token: appToken });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(400).json({ success: false, message: 'Google login failed' });
  }
});

// Connect to MongoDB
mongoose.connect(process.env.CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to the database'))
  .catch((err) => console.error('Database connection error:', err));

// Routes for app
app.use('/api', routes);

// Serving React static files
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// Starting the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// use the games
app.use('/html_games', express.static(path.join(__dirname, '../shared/public/html_games')));


module.exports = app;
