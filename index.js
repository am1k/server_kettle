var connection = require('./connection.js');
var q = require('q');
var mongoose = require('mongoose');
var suid = require('rand-token').suid;
var attachEvents = require('./socket-handlers.js');
var User = require('./user-model.js');
var CompanyModel = require('./company-model.js');

// коннект с базой данных
mongoose.connect('mongodb://localhost/kettles');

connection.io.on('connection', function(socket){
    socket.on('registration', function(data){
        registration(socket, JSON.parse(data));
    });

    socket.on('login', function(data){
        login(socket, JSON.parse( data ));
    });

    attachEvents(socket);
});

connection.io.on('disconnect', function(){
  console.log(arguments)
});

connection.http.listen(3000, function(){
  console.log('listening on *:3000');
});

// создаем обьект, в который помещаем ф-ции для того чтобы была возможность вызвать в другой ф-ции

function createUser(data){
  // инициализация промиса

    data.token = suid(16);
    var defer = q.defer();

    if(data.key){
        CompanyModel.findOne({key: data.key}, function(err, company){
            if(err){
                return console.log(err);
            }
            if(company){
                data.companyId = company._id;
                newUser(defer, data);
            }else{

            }
        });
    } else {
        newCompany(data).then(function(company){
            data.companyId = company._id;
            data.admin = true;
            data.companyKey = company.key;

            newUser(defer, data);
        });
    }

    return defer.promise;
}

function newUser(defer, data){

    if(data.admin){
        data.kettles = 0
    }
    var user = new User(data);
    user.save(function(err){
        if(err){
            defer.reject(err);
            return console.log(err);
        }

        // метод возвращающий обьект промиса со значением
        defer.resolve(user.toObject());
    });
}

function newCompany(data){
    var defer = q.defer(),
        company = new CompanyModel({
            name: data.company,
            key: data.token,
            token: data.token
        });

    company.save(function(err){
        if(err){
            defer.reject(err);
            return console.log(err);
        }

        // метод возвращающий обьект промиса со значением
        defer.resolve(company.toObject());
    });

    return defer.promise;
}

function login(socket, data){

    User.findOne(data, function(err, user){
        if(err){
            return console.log(err);
        }
        if(user){
            socket.emit('login', JSON.stringify({
                Code: 1,
                Description: 'Success login',
                Data: user
            }));
        } else {
            socket.emit('login', JSON.stringify({
                Code: -1,
                Description: 'Wrong value'
            }));
        }
    });
}

function registration(socket, data){
    createUser(data).then(function(){

        // получение с клиента значения токена
        if(data.companyKey !== undefined){
            socket.emit('registration', JSON.stringify({
                Code: 1,
                DescriptionRegistration:  'Your company key is ' + data.companyKey
            }));
        } else {
            socket.emit('registration', JSON.stringify({
                Code: 1,
                DescriptionRegistration:  'Success registration'
            }));
        }
    });
}
