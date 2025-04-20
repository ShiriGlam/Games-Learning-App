const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware= require('../middleware/auth')
// מסלול עבור רישום
router.post('/signup', userController.signup);

// מסלול עבור התחברות
router.post('/login', userController.login);

router.get('/:userId/sets', userController.getUserSets);
router.get('/:userId/progress', authMiddleware, userController.getUserProgress);
router.post('/:userId/import-set-by-category',  userController.importSetByCategory );
module.exports = router;


