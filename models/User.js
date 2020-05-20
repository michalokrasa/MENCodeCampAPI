const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    }
});

module.exports = mongoose.model('Users', UserSchema);