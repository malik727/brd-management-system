const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth.middleware');
const Role = require('../utils/userRoles.utils');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');

const { createUserSchema, updateUserSchema, validateLogin, updatePasswordSchema } = require('../middleware/validators/userValidator.middleware');

router.get('/', auth(), awaitHandlerFactory(userController.getAllUsers));
router.get('/search', auth(), awaitHandlerFactory(userController.searchUser));
router.get('/id/:id', auth(), awaitHandlerFactory(userController.getUserById));
router.get('/employee-id/:empID', auth(), awaitHandlerFactory(userController.getUserByemployeeID));
router.get('/whoami', auth(), awaitHandlerFactory(userController.getCurrentUser));
router.post('/change-password', auth(), updatePasswordSchema, awaitHandlerFactory(userController.updatePassword));
router.post('/', createUserSchema, awaitHandlerFactory(userController.createUser));
router.patch('/id/:id', auth(), updateUserSchema, awaitHandlerFactory(userController.updateUser));
router.delete('/id/:id', auth(Role.SuperUser), awaitHandlerFactory(userController.deleteUser));
router.post('/login', validateLogin, awaitHandlerFactory(userController.userLogin));

module.exports = router;