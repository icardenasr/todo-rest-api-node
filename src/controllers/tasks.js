const { body } = require('express-validator/check');

const Task = require('../models/task');
const User = require('../models/user');
const { errorBuilder } = require('../utils/utils');

module.exports = {

    // Validation for express-validator
    validate: (method) => {
        switch (method) {
            case 'newTask': {
                return [ 
                    body('title', 'The title can not be empty').exists().not().isEmpty().trim(),
                    body('finished', 'Finished must be boolean').exists().isBoolean(),
                ]
            }
            case 'updateTask': {
                return [ 
                    body('title', 'The title can not be empty').optional().not().isEmpty().trim(),
                    body('finished', 'Finished must be boolean').optional().isBoolean(),
                ]
            }
        }
    },
    
    // (get) Get the list of tasks
    index: async (req, res, next) => {
        try {
            const user = await User.findById(req.uid, { password: 0 });
            const tasks = await Task.find({"user": user});
            res.status(200).json(tasks);
        }
        catch(error) {
            const er = { "status": 500, "message": error.message };
            return next(er);
        }
    },

    // (get) Get an existing task
    getTask: async (req, res, next) => {
        try {
            const user = await User.findById(req.uid, { password: 0 });
            const { taskId } = req.params;
            const tasks = await Task.find({"_id": taskId, "user": user});
            if (tasks.length > 0) {
                res.status(200).json(tasks[0]);
            } else {
                res.status(200).json(null);
            }
        }
        catch(error) {
            const er = { "status": 500, "message": error.message };
            return next(er);
        }
    },

    // (post) Create a new task without section
    newTask: async (req, res, next) => {
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
            const newTask = new Task(req.body);
            newTask.user = user;
            const task = await newTask.save();
            res.status(200).json(task);    
        }
        catch(error) {
            const er = { "status": 500, "message": error.message };
            return next(er);
        }
    },
    
    // (patch) Update a data of an existing task 
    updateTask: async (req, res, next) => {
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
            const { taskId } = req.params;
            const newTask = req.body;
            const oldTask = await Task.findOneAndUpdate({"_id": taskId, "user": user}, newTask);
            if (oldTask) {
                const task = await Task.findById(taskId);
                res.status(200).json(task);
            } else {
                res.status(404).json(null);
            }
        }
        catch (error) {
            const er = { "status": 500, "message": error.message };
            return next(er);
        }
    },

    // (delete) Delete an existing task 
    deleteTask: async (req, res, next) => {
        try {
            const user = await User.findById(req.uid, { password: 0 });            
            const { taskId } = req.params;
            const oldTask = await Task.findOneAndRemove({"_id": taskId, "user": user});
            if (oldTask) {
                res.status(200).json({success: true});
            } else {
                res.status(404).json(null);
            }
        }
        catch (error) {
            const er = { "status": 500, "message": error.message };
            return next(er);
        }
    },
    
}