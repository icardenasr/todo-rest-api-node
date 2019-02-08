const crypto = require('crypto');
const { body } = require('express-validator/check');

const User = require('../models/user');
const { errorBuilder } = require('../utils/utils');

module.exports = {

    // Validation for express-validator
    validate: (method) => {
        switch (method) {
            case 'newUser': {
                return [ 
                    body('userId', 'The userId can not be empty').exists().not().isEmpty().trim(),
                    body('email', 'Invalid email').exists().isEmail().normalizeEmail(),
                    body('password', 'The password can not be empty').exists().not().isEmpty(),
                    body('role', 'Invalid role').optional().isInt(),
                ]
            }
            case 'updateUser': {
                return [ 
                    body('userId', 'You can not change the userId').not().exists(),
                    body('email', 'Invalid email').optional().isEmail().normalizeEmail(),
                    body('password', 'The password can not be empty').optional().not().isEmpty(),
                    body('role', 'Invalid role').optional().isInt(),
                ]
            }
        }
    },

    // (get) Get the list of users - Only for admins (role == 1)
    index: async (req, res, next) => {
        try {
            const user = await User.findById(req.uid, { password: 0 });
            if (user.role == 1) {
                const users = await User.find({}, { password: 0 });
                res.status(200).json(users);    
            } else {
                const er = { "status": 401, "message": "Unauthorized action" };
                return next(er);
            }
        }
        catch(error) {
            const er = { "status": 500, "message": error.message };
            return next(er);
        }
    },

    // (get) Get an existing user - Only for admins (role == 1)
    getUser: async (req, res, next) => {
        try {
            const user = await User.findById(req.uid, { password: 0 });
            if (user.role == 1) {
                const { userId } = req.params;
                const user = await User.findById(userId, { password: 0 });
                res.status(200).json(user);    
            } else {
                const er = { "status": 401, "message": "Unauthorized action" };
                return next(er);
            }
        }
        catch(error) {
            const er = { "status": 500, "message": error.message };
            return next(er);
        }
    },

    // (post) Create a new user - Only for admins (role == 1)
    newUser: async (req, res, next) => {
        try {
            const user = await User.findById(req.uid, { password: 0 });
            if (user.role == 1) {
                // VALIDATIONS
                // Format of input data (express-validator)
                const errors = await req.getValidationResult();
                if (!errors.isEmpty()) {
                    const er = errorBuilder(errors);
                    return next(er);
                }
                // "userid" and "email" must be unique
                let users = await User.find({email: req.body.email});
                if (users.length > 0) {
                    const er = { "status": 422, "message": "User email already exists" };
                    return next(er);
                }
                users = await User.find({userId: req.body.userId});
                if (users.length > 0) {
                    const er = { "status": 422, "message": "User ID already exists" };
                    return next(er);
                }
                // Password encription
                const salt = crypto.randomBytes(16).toString('base64');
                const hash = crypto.createHmac('sha512',salt).update(req.body.password).digest("base64");
                req.body.password = salt + "$" + hash;
                // Role preprocessor (default 2: regular)
                if (req.body.role != 1) {
                    req.body.role = 2;
                }
                // LOGIC
                const newUser = new User(req.body);
                let user = await newUser.save();
                user = await User.findById(user._id, { password: 0 });
                res.status(200).json(user);
            } else {
                const er = { "status": 401, "message": "Unauthorized action" };
                return next(er);
            }
        }
        catch(error) {
            const er = { "status": 500, "message": error.message };
            return next(er);
        }
    },
    
    // (patch) Update a data of an existing user - Only for admins (role == 1)
    updateUser: async (req, res, next) => {
        try {
            const user = await User.findById(req.uid, { password: 0 });
            if (user.role == 1) {
                // VALIDATIONS
                // Format of input data (express-validator)
                const errors = await req.getValidationResult();
                if (!errors.isEmpty()) {
                    const er = errorBuilder(errors);
                    return next(er);
                }
                // "userid" and "email", if used, must be unique
                if (req.body.email) {
                    let users = await User.find({email: req.body.email});
                    if (users.length > 0) {
                        const er = { "status": 422, "message": "User email already exists" };
                        return next(er);
                    }    
                }
                if (req.body.userId) {
                    let users = await User.find({userId: req.body.userId});
                    if (users.length > 0) {
                        const er = { "status": 422, "message": "User ID already exists" };
                        return next(er);
                    }    
                }
                // Password encription (if used)
                if (req.body.password) {
                    const salt = crypto.randomBytes(16).toString('base64');
                    const hash = crypto.createHmac('sha512',salt).update(req.body.password).digest("base64");
                    req.body.password = salt + "$" + hash;    
                }
                // Role preprocessor (default 2: regular)
                if (req.body.role) {
                    if (req.body.role != 1) {
                        req.body.role = 2;
                    }    
                }
                // LOGIC
                const { userId } = req.params;
                const newUser = req.body;
                const oldUser = await User.findByIdAndUpdate(userId, newUser);
                const user = await User.findById(userId, { password: 0 });
                res.status(200).json(user);
            } else {
                const er = { "status": 401, "message": "Unauthorized action" };
                return next(er);
            }
        }
        catch(error) {
            const er = { "status": 500, "message": error.message };
            return next(er);
        }
    },

    // (delete) Delete an existing user - Only for admins (role == 1)
    deleteUser: async (req, res, next) => {
        try {
            const user = await User.findById(req.uid, { password: 0 });
            if (user.role == 1) {
                const { userId } = req.params;
                const oldUser = await User.findByIdAndRemove(userId);
                res.status(200).json({success: true});        
            } else {
                const er = { "status": 401, "message": "Unauthorized action" };
                return next(er);
            }
        }
        catch(error) {
            const er = { "status": 500, "message": error.message };
            return next(er);
        }
    },
    
}