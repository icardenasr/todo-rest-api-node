var jwt = require('jsonwebtoken');

const { secret } = require('../config/secret');

module.exports = {

    // Method to build a simple error object from the complex express-validator errors object
    errorBuilder: (errors) => {
        var message = "";
        var arrayLength = errors.array().length;
        for (var i = 0; i < arrayLength; i++) {
            message = message + errors.array()[i].msg + ". ";
        }
        return ({ "status": 422, "message": message.trim() });
    },

    // Method used as middleware to verify auth tokens
    verifyToken: async (req, res, next) => {
        try {
            const token = req.headers['x-access-token'];
            if (!token) {
                const er = { "status": 401, "message": "User not authenticated. No token provided" };
                return next(er);
            } else {
                const decoded = await jwt.verify(token, secret);
                req.uid = decoded.id;
                next();
            }    
        }
        catch(error) {
            const er = { "status": 401, "message": error.message };
            return next(er);
        }
    },

}