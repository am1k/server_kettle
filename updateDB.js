var updateDB;
var q = require('q');
var connection = require('./connection.js');

updateDB = function(model, id, cb, fieldName){
    var defer = q.defer();
    model.findOne({_id: id}, function(err, data){
       if(err){
           return defer.reject(err);
       }
        // изменения с данными
        cb(data);

        if( data !== null) {
            data.save(function(err){
                if(err){
                    return defer.reject(err);
                }
                connection.io.to(data._id.toString()).emit('change', JSON.stringify({
                    name: fieldName,
                    value: data[fieldName]
                }));

                defer.resolve(data._id.toString());
            });
        } else {
            console.log('error');
        }
    });

    return defer.promise;
};

module.exports = updateDB;