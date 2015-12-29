var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userSchema = new Schema({
    token: String,
    free: {
        type: Boolean,
        default: true
    },
    kettles: {
        type: Number,
        default: 0
    }
}, {
    collection: 'users'
});
var User = mongoose.model('User', userSchema);

module.exports = User;