var _ = require('lodash');
var q = require('q');
var connection = require('./connection.js');
var KettleModel = require('./kettle-model.js');
var updateDB = require('./updateDB.js');
var kettleEngine;

kettleEngine = {

    //для корректной работы таймера
    timers: {},

    boil: function(id, targetDegree, isCold){

         var self = this,
             defer = q.defer();

        updateDB(KettleModel, id, function(data){
            data.powerOn = true;
        }, 'powerOn').then(function(id){
            clearTimeout(self.timers[id]);
            self.tick(id, targetDegree, isCold, defer);
        });

        return defer.promise;
    },

    // реализация кипения, так же охлаждения
    tick: function(id, targetDegree, isCold, defer){
        updateDB(KettleModel, id, function(data){
            if(data !== null) {
                if(isCold ? data.degree > targetDegree : data.degree < targetDegree){
                    isCold ? data.degree-- : data.degree++;
                    // привязка к айди чайника и управление его таймеров
                    //bind(this) для выбора tick();
                    this.timers[id] = setTimeout(this.tick.bind(this), 1000, id, targetDegree, isCold, defer);

                } else if(!isCold && data.degree == targetDegree) {
                    console.log('cold');
                    defer.resolve(data.name);
                    this.cold(id);
                }
            } else {
                return console.log('err');
            }
        }.bind(this), 'degree');
    },

    cold: function(id) {
        updateDB(KettleModel, id, function(data){
            if (data.degree > 0) {
                data.powerOn = false;
                this.tick(id, data.minDegree, true);
            }
        }.bind(this), 'powerOn');
    }
};

module.exports = kettleEngine;
