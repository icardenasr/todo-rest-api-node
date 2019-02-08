const { body } = require('express-validator/check');

const Section = require('../models/section');
const Task = require('../models/task');
const User = require('../models/user');
const { errorBuilder } = require('../utils/utils');

module.exports = {

    // Validation for express-validator
    validate: (method) => {
        switch (method) {
            case 'newSection': {
                return [ 
                    body('name', 'The name can not be empty').exists().not().isEmpty().trim(),
                ]
            }
            case 'updateSection': {
                return [ 
                    body('name', 'The name can not be empty').exists().not().isEmpty().trim(),
                ]
            }
            case 'newSectionTask': {
                return [ 
                    body('title', 'The title can not be empty').exists().not().isEmpty().trim(),
                    body('finished', 'Finished must be boolean').exists().isBoolean(),
                ]
            }
        }
    },

    // (get) Get the list of sections
    index: async (req, res, next) => {
        try {
            const user = await User.findById(req.uid, { password: 0 });
            const sections = await Section.find({"user": user});
            res.status(200).json(sections);
        }
        catch(error) {
            const er = { "status": 500, "message": error.message };
            return next(er);
        }
    },

    // (get) Get an existing section
    getSection: async (req, res, next) => {
        try {
            const user = await User.findById(req.uid, { password: 0 });
            const { sectionId } = req.params;
            const sections = await Section.find({"_id": sectionId, "user": user}).populate('tasks');
            if (sections.length > 0) {
                res.status(200).json(sections[0]);
            } else {
                res.status(404).json(null);
            }
        }
        catch(error) {
            const er = { "status": 500, "message": error.message };
            return next(er);
        }
    },

    // (post) Create a new section
    newSection: async (req, res, next) => {
        try {
            // VALIDATIONS
            // Format of input data (express-validator)
            const errors = await req.getValidationResult();
            if (!errors.isEmpty()) {
                const er = errorBuilder(errors);
                return next(er);
            }
            // LOGIC
            const user = await User.findById(req.uid, { password: 0 });
            const newSection = new Section(req.body);
            newSection.user = user;
            const section = await newSection.save();
            res.status(200).json(section);
        }
        catch(error) {
            const er = { "status": 500, "message": error.message };
            return next(er);
        }
    },
    
    // (patch) Update a data of an existing section 
    updateSection: async (req, res, next) => {
        try {
            // VALIDATIONS
            // Format of input data (express-validator)
            const errors = await req.getValidationResult();
            if (!errors.isEmpty()) {
                const er = errorBuilder(errors);
                return next(er);
            }
            // LOGIC
            const user = await User.findById(req.uid, { password: 0 });            
            const { sectionId } = req.params;
            const newSection = req.body;
            const oldSection = await Section.findOneAndUpdate({"_id": sectionId, "user": user}, newSection);
            if (oldSection) {
                const section = await Section.findById(sectionId).populate('tasks');
                res.status(200).json(section);
            } else {
                res.status(404).json(null);
            }
        }
        catch(error) {
            const er = { "status": 500, "message": error.message };
            return next(er);
        }
    },

    // (delete) Delete an existing section 
    deleteSection: async (req, res, next) => {
        try {
            const user = await User.findById(req.uid, { password: 0 });            
            const { sectionId } = req.params;
            const oldSection = await Section.findOneAndRemove({"_id": sectionId, "user": user});
            if (oldSection) {
                res.status(200).json({success: true});    
            } else {
                res.status(404).json(null);
            }
        }
        catch(error) {
            const er = { "status": 500, "message": error.message };
            return next(er);
        }
    },

    // (get) Get the list of tasks of a section
    getSectionTasks: async (req, res, next) => {
        try {
            const user = await User.findById(req.uid, { password: 0 });            
            const { sectionId } = req.params;
            const sections = await Section.find({"_id": sectionId, "user": user}).populate('tasks');
            if (sections.length > 0) {
                res.status(200).json(sections[0].tasks);
            } else {
                res.status(404).json(null);
            }
        }
        catch(error) {
            const er = { "status": 500, "message": error.message };
            return next(er);
        }
    },

    // (post) Create a new task in a section
    newSectionTask: async (req, res, next) => {
        try {
            // VALIDATIONS
            // Format of input data (express-validator)
            const errors = await req.getValidationResult();
            if (!errors.isEmpty()) {
                const er = errorBuilder(errors);
                return next(er);
            }
            // LOGIC
            const user = await User.findById(req.uid, { password: 0 });            
            const { sectionId } = req.params;
            const sections = await Section.find({"_id": sectionId, "user": user});
            if (sections.length > 0) {
                let newTask = new Task(req.body);
                let section = sections[0];
                newTask.section = section;
                await newTask.save();
                section.tasks.push(newTask);
                await section.save();
                res.status(200).json(newTask);    
            } else {
                res.status(404).json(null);
            }
        }
        catch(error) {
            const er = { "status": 500, "message": error.message };
            return next(er);
        }
    },
    
}