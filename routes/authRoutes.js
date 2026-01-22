const router = require('express').Router();
const authController = require('../controllers/authController');
const authorization = require('../middleware/authorization');

router.post('/register', authController.register);

router.post('/login', authController.login);

router.get('/profile', authorization, authController.getProfile);

router.put('/profile', authorization, authController.updateProfile);

router.get('/users', authorization, authController.getAllUsers);

router.delete('/delete/:id', authorization, authController.deleteUser); 

router.put('/suspend/:id', authorization, authController.suspendUser);

router.post('/forgot-password', authController.forgotPassword);

router.post('/reset-password/:id/:token', authController.resetPassword);

module.exports = router;