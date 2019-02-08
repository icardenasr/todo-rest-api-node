const crypto = require('crypto');
const { body } = require('express-validator/check');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const { errorBuilder } = require('../utils/utils');
const { secret } = require('../config/secret');

module.exports = {

    // Validation for express-validator
    validate: (method) => {
        switch (method) {
            case 'authUser': {
                return [ 
                    body('user', 'The userId can not be empty').exists().not().isEmpty().trim(),
                    body('password', 'The password can not be empty').exists().not().isEmpty(),
                ]
            }
        }
    },

    // (get) Get authenticated user information
    index: async (req, res, next) => {
        try {
            const user = await User.findById(req.uid, { password: 0 });
            res.status(200).json(user);
        }
        catch(error) {
            const er = { "status": 500, "message": error.message };
            return next(er);
        }
    },

    // (post) Authentication for users
    authUser: async (req, res, next) => {
        try {
            // VALIDATIONS
            // Format of input data (express-validator)
            const errors = await req.getValidationResult();
            if (!errors.isEmpty()) {
                const er = errorBuilder(errors);
                return next(er);
            }
            // LOGIC
            const users = await User.findByWhatever(req.body.user);
            if (users && (users.length > 0)) {
                let passwordFields = users[0].password.split('$');
                let salt = passwordFields[0];
                let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
                if (hash === passwordFields[1]) {
                    // Create a token
                    let token = jwt.sign({
                        id: users[0]._id,
                    }, secret, { expiresIn: 86400 });
                    res.status(200).json({auth: true, token: token});
                } else {
                    const er = { "status": 400, "message": "Invalid credentials" };
                    return next(er);
                }

            } else {
                const er = { "status": 400, "message": "Invalid credentials" };
                return next(er);
            }
        }
        catch(error) {
            const er = { "status": 500, "message": error.message };
            return next(er);
        }
    },

}