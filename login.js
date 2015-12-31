var _ = require('lodash');
var connection = require('./connection.js');
var UserModel = require('./user-model.js');
var updateDB = require('./updateDB.js');

function checkUser(socket, user){

    UserModel.find({userId: user._id}, function(err, data){
        if(err){
            return console.log(err);
        }
        user = data;

        // передача данных на клиент
        socket.emit('login', JSON.stringify(user));
    });


}

module.exports = checkUser;
