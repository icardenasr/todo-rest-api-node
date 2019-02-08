const express = require('express');

const { verifyToken } = require('../utils/utils');

const router = express.Router();

// Methods imported from controller
const {
    validate,
    index,
    newUser,
    getUser,
    updateUser,
    deleteUser,
} = require('../controllers/users');

// Routes using the methods imported
router.get('/', verifyToken, index);
router.get('/:userId', verifyToken, getUser);
router.post('/', verifyToken, validate('newUser'), newUser);
router.patch('/:userId', verifyToken, validate('updateUser'), updateUser);
router.delete('/:userId', verifyToken, deleteUser);

module.exports = router;
