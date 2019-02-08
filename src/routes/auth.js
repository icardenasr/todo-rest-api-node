const express = require('express');

const { verifyToken } = require('../utils/utils');

const router = express.Router();

// Methods imported from controller
const {
    validate,
    index,
    authUser,
} = require('../controllers/auth');

// Routes using the methods imported
router.get('/', verifyToken, index); // Middleware to verify auth token
router.post('/', validate('authUser'), authUser); // Middleware to verify input data

module.exports = router;
