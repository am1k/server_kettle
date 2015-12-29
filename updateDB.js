var updateDB;
var connection = require('./connection.js');

updateDB = function(model, data, fieldName){
    model.update({_id: data._id}, { $set: data }, function(err){
        if(err){
            return console.log(err);
        }
        connection.io.to(data._id.toString()).emit('change', JSON.stringify({
            name: fieldName,
            value: data[fieldName]
        }));
    });
};

module.exports = updateDB;