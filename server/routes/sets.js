const express = require('express');
const setController = require('../controllers/setController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/create', authMiddleware, setController.createSet);
router.get('/:setId',  setController.getSetById);
router.get('/weaks/:setId',  setController.getWeakSetById);
router.get('/search/:query',setController.searchSets);
router.post('/update-knowledge/:setName',authMiddleware, setController.updateKnowledgeCount);

router.post('/:setId/update', authMiddleware, setController.updateSet);

module.exports = router;
