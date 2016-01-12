var _ = require('lodash');
var KettleModel = require('./kettle-model.js');
var UserModel = require('./user-model.js');
var kettleEngine = require('./kettle-engine.js');
var updateDB = require('./updateDb.js');
var information = [];

function attachEvents(socket){
    var currentId,
        currentModel,
        kettles;

    socket.on('addDevice', function(data){
        var data = JSON.parse(data);
        var kettle;

        console.log(data,11111);
        UserModel.findOne({companyId: data.companyId, admin: true}, function(err, user){

            console.log(user,22222);
            if(err){
                return console.log(err);
            }

            kettle = new KettleModel({
                companyId: data.companyId,
                name: data.name
            });

            kettle.save(function(err){
                if(err){
                    return console.log(err);
                }

                console.log(user);

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

                socket.emit('addDevice', JSON.stringify(kettle));
            });
        });
    });


    socket.on('remove', function(data){
        data = JSON.parse(data);
        KettleModel.remove({_id: data._id}, function(err){
            if(err){
                console.log(err)
            }
            UserModel.findOne({
                companyId: data.companyId,
                admin: true
            }, function(err, user){
                if(err){
                    console.log(err);
                }
                user.kettles--;
                user.save(function(err){
                    if(err){
                        return console.log(err);
                    }
                    socket.emit('user:change', JSON.stringify({
                        name: 'kettles',
                        value: user.kettles
                    }));
                });
                socket.emit('remove', '1');
            });
        });
    });

    // передача информации(конфигурационных данных)
    socket.on('getKettles', function(companyId){
        console.log(companyId);
        // поиск в базе юзера по companyId;
        KettleModel.find({companyId: companyId}, function(err, data){
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

    socket.on('buy', function(id){
        UserModel.update({_id: id}, {$set: { free: false }}, function(err){
            if(err){
                return console.log(err);
            }
            socket.emit('buy', '1');
        })
    });

}

module.exports = attachEvents;