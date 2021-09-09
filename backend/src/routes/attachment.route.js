const express = require('express');
const router = express.Router();
const attController = require('../controllers/attachment.controller');
const auth = require('../middleware/auth.middleware');
const Role = require('../utils/userRoles.utils');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');

router.post('/upload', auth(Role.Manager), awaitHandlerFactory(attController.uploadAttachments));
router.post('/bind', auth(Role.Manager), awaitHandlerFactory(attController.bindAttachments));
router.get('/brdId/:brdId', auth(), awaitHandlerFactory(attController.getAttachments));
router.get('/key/:key', auth(), awaitHandlerFactory(attController.getFile));
router.delete('/id/:id', auth(Role.Manager), awaitHandlerFactory(attController.deleteAttachment));

module.exports = router;