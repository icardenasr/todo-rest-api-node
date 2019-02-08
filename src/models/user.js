const mongoose = require('mongoose');
const mfbw = require('mongoose-find-by-whatever');

mongoose.set('useFindAndModify', false);

const userSchema = new mongoose.Schema({
    userId: String,
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    role: Number // 1: admin, 2: regular
});

var whatevers = [
    {email: /@/} // Regexp
  , {userId: '*'} // Everything
];

userSchema.plugin(mfbw, whatevers);

module.exports = mongoose.model('user', userSchema);
