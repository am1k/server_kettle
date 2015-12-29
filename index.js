var connection = require('./connection.js');
var q = require('q');
var mongoose = require('mongoose');
var suid = require('rand-token').suid;
var attachEvents = require('./socket-handlers.js');
var User = require('./user-model.js');

// коннект с базой данных
mongoose.connect('mongodb://localhost/kettles');

// инициализация модели
var user = new User();

connection.io.on('connection', function(socket){
  var token = socket.handshake.query.token;

  // При коннекте происходит проверка, на существования токена, если токена нет, запускается его создание

  //socket.handshake.query.token - значение токена
  if(!token){
      newUser(socket);
  }else{
    // если токен есть, происходит првоерка на соответствие токена с имеющимся в локалсторедже, если они не соответствую
    // запускается его новая генерация
      User.findOne({token: token}, function(err, user){
          if(err){
            return console.log(err);
          }
          if(!user){
              newUser(socket);
              return;
          }
          socket.emit('user', JSON.stringify(user));
          attachEvents(socket, user);
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

function createUser(){
  // инициализация промиса
  var defer = q.defer(),
      user = new User({
        token: suid(16)
      });
  user.save(function(err){
    if(err){
      defer.reject(err);
      return console.log(err);
    }
    // метод возвращающий обьект промиса со значением
    defer.resolve(user.toObject());
  });

    return defer.promise;
}

function newUser(socket){
    createUser().then(function(user){
        // получение с клиента значения токена
        socket.emit('user', JSON.stringify(user));

        // создание по набору чайников и параметров
        attachEvents(socket, user);
    });
}
