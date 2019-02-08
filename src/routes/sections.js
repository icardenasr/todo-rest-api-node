const express = require('express');

const { verifyToken } = require('../utils/utils');

const router = express.Router();

// Methods imported from controller
const {
    validate,
    index,
    newSection,
    getSection,
    updateSection,
    deleteSection,
    getSectionTasks,
    newSectionTask
} = require('../controllers/sections');

// Routes using the methods imported
router.get('/', verifyToken, index);
router.get('/:sectionId', verifyToken, getSection);
router.post('/', verifyToken, validate('newSection'), newSection);
router.patch('/:sectionId', verifyToken, validate('updateSection'),  updateSection);
router.delete('/:sectionId', verifyToken, deleteSection);
router.get('/:sectionId/tasks', verifyToken, getSectionTasks);
router.post('/:sectionId/tasks', verifyToken, validate('newSectionTask'),  newSectionTask);

module.exports = router;
