const express = require('express');
const router = express.Router();
const brdController = require('../controllers/brd.controller');
const auth = require('../middleware/auth.middleware');
const Role = require('../utils/userRoles.utils');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');

const { createBRDSchema, updateBRDSchema } = require('../middleware/validators/brdValidator.middleware');

router.get('/due/:days', auth(), awaitHandlerFactory(brdController.getAllDueBRD));
router.get('/', auth(Role.Manager), awaitHandlerFactory(brdController.getAllBRD));
router.get('/pending', auth(Role.Manager), awaitHandlerFactory(brdController.getAllPendingBRD));
router.get('/assigned', auth(), awaitHandlerFactory(brdController.getAllAssignedBRD));
router.get('/completed', auth(), awaitHandlerFactory(brdController.getAllCompletedBRD));
router.get('/id/:id', auth(), awaitHandlerFactory(brdController.getBRDByID));
router.get('/assignees/brdId/:brdId', auth(), awaitHandlerFactory(brdController.getAssignees));
router.get('/public-holidays/:days', auth(), awaitHandlerFactory(brdController.getPublicHolidays));
router.post('/', auth(Role.Manager), createBRDSchema, awaitHandlerFactory(brdController.createBRD));
router.post('/assign', auth(Role.Manager), awaitHandlerFactory(brdController.addAssignees));
router.patch('/id/:id', auth(Role.Manager), updateBRDSchema, awaitHandlerFactory(brdController.updateBRD));
router.delete('/id/:id', auth(Role.Manager), awaitHandlerFactory(brdController.deleteBRD));

module.exports = router;