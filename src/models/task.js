const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const taskSchema = new mongoose.Schema({
    title: String,
    description: String,
    finished: Boolean,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'section'
    }
});

module.exports = mongoose.model('task', taskSchema);
