const HttpException = require('../utils/HttpException.utils');
const UserModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const auth = (...roles) => {
    return async function (req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            const bearer = 'Bearer ';

            if (!authHeader || !authHeader.startsWith(bearer)) {
                throw new HttpException(401, 'Access denied. No credentials sent!');
            }

            const token = authHeader.replace(bearer, '');
            const secretKey = process.env.JWT_KEY || "";

            // Verify JWT Token
            const decoded = jwt.verify(token, secretKey);
            const user = await UserModel.findOne({ id: decoded.user_id });

            if (!user) {
                throw new HttpException(401, 'Authentication failed!');
            }

            // Store the user
            req.currentUser = user;

            // This condition requires "role" attribute in the users table to work correctly
            if (roles.length && !roles.includes(user.role)) {
                throw new HttpException(401, `Unauthorized. A user having role of ${roles} is required to access this end point!`);
            }

            // if the user has permissions
            next();

        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

module.exports = auth;