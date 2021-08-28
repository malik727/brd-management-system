const { body } = require('express-validator');

exports.createBRDSchema = [
    body('created_by')
        .exists()
        .withMessage('Creators ID is required')
        .isInt()
        .withMessage('Creators ID must have a valid value'),
    body('origin')
        .exists()
        .withMessage('Origin is required'),
    body('title')
        .exists()
        .withMessage('Title is required'),
    body('justification')
        .exists()
        .withMessage('Justification is required'),
    body('priority')
        .exists()
        .withMessage('Priority is required')
        .isIn(['High', 'Medium', 'Low'])
        .withMessage('Priority must have a valid value'),
    body('status')
        .exists()
        .withMessage('Status is required')
        .isIn(['Assigned', 'Pending'])
        .withMessage('Status must have a valid value'),
    body('purpose')
        .exists()
        .withMessage('Purpose is required')     
];

exports.updateBRDSchema = [
    body('origin')
        .optional(),
    body('title')
        .optional(),
    body('justification')
        .optional(),
    body('priority')
        .optional()
        .isIn(['High', 'Medium', 'Low'])
        .withMessage('Priority must have a valid value'),
    body('status')
        .optional()
        .isIn(['Assigned', 'Pending', 'Completed'])
        .withMessage('Status must have a valid value'),
    body('purpose')
        .optional(),
    body('due_date')
        .optional()
        .isISO8601()
        .withMessage('Invalid Due Date input!')     
];