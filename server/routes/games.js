
// routes/gameRoutes.js
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const {uploadZipGame} = require('../controllers/uploadZipGame');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
router.post('/create', authMiddleware,gameController.createGame);
router.delete('/delete/:gameId',authMiddleware, gameController.deleteGame);
router.get('/get', gameController.getGames);
router.get('/gettop3', gameController.getTop3Games);
router.get('/search/:query', gameController.searchGames);
router.post('/:gameId/update-popularity', gameController.updatePopularity);
router.post('/:gameId/rate', gameController.rateGame);

router.post('/upload-zip', authMiddleware, upload.single('zipFile'), uploadZipGame);

module.exports = router;