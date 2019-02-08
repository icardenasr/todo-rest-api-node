const express = require('express');

const { verifyToken } = require('../utils/utils');

const router = express.Router();

// Methods imported from controller
const {
    validate,
    index,
    newTask,
    getTask,
    updateTask,
    deleteTask
} = require('../controllers/tasks');

// Routes using the methods imported
router.get('/', verifyToken, index);
router.get('/:taskId', verifyToken, getTask);
router.post('/', verifyToken, validate('newTask'),  newTask);
router.patch('/:taskId', verifyToken, validate('updateTask'), updateTask);
router.delete('/:taskId', verifyToken, deleteTask);

module.exports = router;
