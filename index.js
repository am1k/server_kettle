var connection = require('./connection.js');
var q = require('q');
var mongoose = require('mongoose');
var suid = require('rand-token').suid;
var attachEvents = require('./socket-handlers.js');
var User = require('./user-model.js');
var CompanyModel = require('./company-model.js');

// коннект с базой данных
mongoose.connect('mongodb://localhost/kettles');

// инициализация модели
var user = new User();

connection.io.on('connection', function(socket){
    var token = socket.handshake.query.token;

    socket.on('registration', function(data){
        registration(socket, JSON.parse(data));
    });

    if(token){
        User.findOne({token: token}, function(err, user){
            if(err){
                return console.log(err);
            }
            if(user){
                socket.emit('user', JSON.stringify(user));
                attachEvents(socket, user);

                return;
            }
            socket.emit('user', JSON.stringify({Code: -1}));
        });
    }
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
    var defer = q.defer().promise,
        company,
        user;
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
    }else{
        console.log(data);
        company = new CompanyModel({
            name: data.company,
            key: data.token
        });

        data.companyId = company._id;

        newCompany(defer, data);
    }

    return defer;
}

function newUser(defer, data){
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

function newCompany(defer,data){
    var company = new CompanyModel(data);

    company.save(function(err){
        if(err){
            defer.reject(err);
            return console.log(err);
        }
        // метод возвращающий обьект промиса со значением
        defer.resolve(company.toObject());
    });
}

function registration(socket, data){
    createUser(data).then(function(user){
        // получение с клиента значения токена
        socket.emit('user', JSON.stringify(user));

        // создание по набору чайников и параметров
        attachEvents(socket, user);
    });
}
