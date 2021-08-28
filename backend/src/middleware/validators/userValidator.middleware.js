const { body } = require('express-validator');

exports.createUserSchema = [
    body('emp_id')
        .exists()
        .withMessage('Employee ID is required')
        .isLength({ min: 3 })
        .withMessage('Must be at least 3 characters long'),
    body('email')
        .exists()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Must be a valid email address'),
    body('first_name')
        .exists()
        .withMessage('Your first name is required')
        .isAlpha()
        .withMessage('Must be only alphabetical chars')
        .isLength({ min: 3 })
        .withMessage('Must be at least 3 chars long'),
    body('last_name')
        .exists()
        .withMessage('Your last name is required')
        .isAlpha()
        .withMessage('Must be only alphabetical chars')
        .isLength({ min: 3 })
        .withMessage('Must be at least 3 chars long'),
    body('gender')
        .exists()
        .withMessage('Gender is required')
        .isIn(['Male', 'Female', 'Other'])
        .withMessage('Gender must have a valid value'),
    body('password')
        .exists()
        .withMessage('Password is required')
        .notEmpty()
        .isLength({ min: 6 })
        .withMessage('Password must contain at least 6 characters'),
    body('confirm_password')
        .exists()
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Confirm Password field must have the same value as the Password field'),
    body('department')
        .exists()
        .withMessage('Department is required'),
    body('designation')
        .exists()
        .withMessage('Designation is required')     
];

exports.updateUserSchema = [
    body('first_name')
        .optional()
        .isAlpha()
        .withMessage('Must be only alphabetical chars')
        .isLength({ min: 3 })
        .withMessage('Must be at least 3 chars long'),
    body('last_name')
        .optional()
        .isAlpha()
        .withMessage('Must be only alphabetical chars')
        .isLength({ min: 3 })
        .withMessage('Must be at least 3 chars long'),
    body('gender')
        .optional()
        .isIn(['Male', 'Female', 'Other'])
        .withMessage('Gender must have a valid value'),
    body('department')
        .optional(),
    body('designation')
        .optional(), 
    body()
        .custom(value => {
            return !!Object.keys(value).length;
        })
        .withMessage('Please provide required field to update')
        .custom(value => {
            const updates = Object.keys(value);
            const allowUpdates = ['first_name', 'last_name', 'gender', 'department', 'designation'];
            return updates.every(update => allowUpdates.includes(update));
        })
        .withMessage('Invalid updates!')
];

exports.updatePasswordSchema = [
    body('password')
        .exists()
        .withMessage('Current Password is required'),
    body('new_password')
        .exists()
        .withMessage('New Password is required')
        .notEmpty()
        .isLength({ min: 6 })
        .withMessage('Password must contain at least 6 characters'),
    body('confirm_password')
        .exists()
        .custom((value, { req }) => value === req.body.new_password)
        .withMessage('Confirm Password field must have the same value as the New Password field')
];

exports.validateLogin = [
    body('emp_id')
        .exists()
        .withMessage('Employee ID is required'),
    body('password')
        .exists()
        .withMessage('Password is required')
        .notEmpty()
        .withMessage('Password must be filled')
];

// Create Change Password Export