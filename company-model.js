var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var companyModel = new Schema({
    name: {
        type: String
    },
    key: {
        type: String
    },
    token: {
        type: String
    }
}, {
    collection: 'companies'
});
var CompanyModel = mongoose.model('Company', companyModel);

module.exports = CompanyModel;