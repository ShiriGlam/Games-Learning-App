
const express = require('express');
const router = express.Router();

const userRoutes = require('./users');
const setRoutes = require('./sets');
const gamesRoutes = require('./games');
const ChatAsker = require('../controllers/ChatGptAsker');
router.use('/users', userRoutes);
router.use('/sets', setRoutes);
router.use('/games', gamesRoutes);
router.use('/ask-gpt',ChatAsker.askChat );
router.use('/ask-gpt-advice',ChatAsker.askChatAdvice );
module.exports = router;
