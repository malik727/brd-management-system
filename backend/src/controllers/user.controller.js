const UserModel = require('../models/user.model');
const HttpException = require('../utils/HttpException.utils');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

class UserController {
    getAllUsers = async (req, res, next) => {
        let userList = await UserModel.find();
        if (!userList.length) {
            throw new HttpException(404, 'Users not found');
        }

        userList = userList.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        res.json(userList);
    };

    getUserById = async (req, res, next) => {
        const user = await UserModel.findOne({ id: req.params.id });
        if (!user) {
            throw new HttpException(404, 'User not found');
        }

        const { password, ...userWithoutPassword } = user;

        res.json(userWithoutPassword);
    };

    getUserByemployeeID = async (req, res, next) => {
        const user = await UserModel.findOne({ emp_id: req.params.empID });
        if (!user) {
            throw new HttpException(404, 'User not found');
        }

        const { password, ...userWithoutPassword } = user;

        res.json(userWithoutPassword);
    };

    getCurrentUser = async (req, res, next) => {
        const { password, ...userWithoutPassword } = req.currentUser;

        res.json(userWithoutPassword);
    };

    createUser = async (req, res, next) => {
        this.checkValidation(req);

        await this.hashPassword(req);

        const result = await UserModel.create(req.body);

        if (!result) {
            throw new HttpException(500, 'Something went wrong');
        }

        res.status(201).json('User was created!');
    };

    updateUser = async (req, res, next) => {
        this.checkValidation(req);
        const role = req.currentUser.role;
        const user_id = req.currentUser.id;
        const { ...userUpdates } = req.body;
        if(role === "Manager" || role === "SuperUser")
        {
            const result = await UserModel.update(userUpdates, req.params.id);
            if (!result) {
                throw new HttpException(404, 'Something went wrong');
            }
            const { affectedRows, changedRows, info } = result;
            const message = !affectedRows ? 'User not found' :
                affectedRows && changedRows ? 'User updated successfully' : 'Failed to update user details';
            res.json({ message, info });
        }
        else
        {
            if(req.params.id === user_id)
            {
                const result = await UserModel.update(userUpdates, user_id);
                if (!result) {
                    throw new HttpException(404, 'Something went wrong');
                }
                const { affectedRows, changedRows, info } = result;
                const message = !affectedRows ? 'User not found' :
                    affectedRows && changedRows ? 'User updated successfully' : 'Failed to update user details';
                res.json({ message, info });
            }
            else
            {
                res.status(400).json("Not allowed to update other users information!");
            }
        }
    };

    updatePassword = async (req, res, next) => {
        this.checkValidation(req);
        await this.hashPassword(req);
        const verifyPass = await UserModel.verifyPassword(req.params.id, req.params.password);
        if(verifyPass == true)
        {
            const { new_password } = req.body;
            const result = await UserModel.update({password: new_password}, req.params.id);
            if (!result) {
                throw new HttpException(404, 'Something went wrong');
            }
    
            const { affectedRows, changedRows, info } = result;
    
            const message = !affectedRows ? 'User not found' :
                affectedRows && changedRows ? 'User details updated successfully' : 'Failed to update user details';
    
            res.json({ message, info });
        }
        else
        {
            throw new HttpException(400, 'Incorrect password! Please try again with a valid password');
        }
    };

    deleteUser = async (req, res, next) => {
        const result = await UserModel.delete(req.params.id);
        if (!result) {
            throw new HttpException(404, 'User not found');
        }
        res.json('User has been deleted');
    };

    searchUser = async (req, res, next) => {
        let userList = await UserModel.search({ searchQuery: req.query.query });
        if (!userList) {
            throw new HttpException(404, 'No results found');
        }
        userList = userList.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
        res.json(userList);
    };

    userLogin = async (req, res, next) => {
        this.checkValidation(req);

        const { emp_id, password: pass } = req.body;

        const user = await UserModel.findOne({ emp_id });

        if (!user) {
            throw new HttpException(401, 'Unable to login! User does not exist');
        }

        const isMatch = await bcrypt.compare(pass, user.password);

        if (!isMatch) {
            throw new HttpException(401, 'Incorrect password! Please try again with a valid password');
        }

        // user matched!
        const secretKey = process.env.JWT_KEY || "";
        const token = jwt.sign({ user_id: user.id.toString() }, secretKey, {
            expiresIn: '24h'
        });

        const { password, ...userWithoutPassword } = user;

        res.json({ ...userWithoutPassword, token });
    };

    delay = (delayInms) => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(2);
          }, delayInms);
        });
    }

    checkValidation = (req) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            throw new HttpException(400, 'Validation faild', errors);
        }
    }

    // hash password if it exists
    hashPassword = async (req) => {
        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 8);
        }
    }
}

module.exports = new UserController;