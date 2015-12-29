var _ = require('lodash');
var KettleModel = require('./kettle-model.js');
var UserModel = require('./user-model.js');
var kettleEngine = require('./kettle-engine.js');
var updateDB = require('./updateDb.js');
var information = [];

function attachEvents(socket, user){
    var currentId,
        currentModel,
        kettles;

    socket.on('addDevice', function(name){
        var kettle = new KettleModel({
            userId: user._id,
            name: name
        });
        kettle.save(function(err){
            if(err){
                return console.log(err);
            }

            UserModel.findOne({_id: user._id}, function(err, user){
                if(err){
                    return console.log(err);
                }
                user.kettles++;
                user.save(function(err){
                    if(err){
                        return console.log(err);
                    }
                    socket.emit('user:change', JSON.stringify({
                        name: 'kettles',
                        value: user.kettles
                    }));
                });
            });

            socket.emit('addDevice', JSON.stringify(kettle));
        });
    });
    // передача информации(конфигурационных данных)
    socket.on('getKettles', function(){
        // поиск в базе юзера по userId;
        KettleModel.find({userId: user._id}, function(err, data){
            if(err){
                return console.log(err);
            }
            kettles = data;
            //console.log(kettles);

            // передача данных на клиент
            socket.emit('getKettles', JSON.stringify(kettles));
        });
    });

    // отвечает за созднаие каналов для чайников
    socket.on('changeKettle', function(id){
        console.log(id, typeof id);
        currentId && socket.leave(currentId);
        socket.join(id);
        currentId = id;


        KettleModel.findOne({_id: id}, function(err, data){
            if(err){
                return console.log(err);
            }
            currentModel = data;

            socket.emit('changeKettle', JSON.stringify(currentModel));
        });
        // передаем id текущего чайника, который включен на клиенте и возвращаем пар-ры для этого чайника при изменении чайника

    });

    // отвечает за ф-ционал чайников
    socket.on('boil', function(data){
        information = JSON.parse(data);
        kettleEngine.boil(kettles, information._id,  information.targetDegree, information.isCold);
    });

    socket.on('buy', function(){
        user.free = false;
        UserModel.update({_id: user._id}, {$set: { free: user.free }}, function(err){
            if(err){
                return console.log(err);
            }
            socket.emit('buy', '1');
        })
    });

}

module.exports = attachEvents;