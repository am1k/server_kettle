var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var userSchema = new Schema({
    token: String,

    kettles: {
        type: Number,
        default: 0
    },

    login: {
        type: String
    },

    password: {
        type: String
    },

    companyId: {
        type: ObjectId
    },
    admin: {
        type: Boolean,
        default: false
    }

}, {
    collection: 'users'
});
var User = mongoose.model('User', userSchema);

module.exports = User;