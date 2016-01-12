var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var kettleSchema = new Schema({
    companyId: ObjectId,

    name: {
        type: String
    },
    degree: {
        type: Number,
        default: 50
    },
    minDegree: {
        type: Number,
        default: 30
    },
    waterLevel: {
        type: Number,
        default: 50
    },
    powerOn: {
        type: Boolean,
        default: false
    }
}, {
    collection: 'kettles'
});
var KettleModel = mongoose.model('Default', kettleSchema);

module.exports = KettleModel;