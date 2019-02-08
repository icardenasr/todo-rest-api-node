const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const sectionSchema = new mongoose.Schema({
    name: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'task'
    }]
});

module.exports = mongoose.model('section', sectionSchema);
