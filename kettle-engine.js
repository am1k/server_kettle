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

         var kettle,
             self = this,
             defer = q.defer();

         KettleModel.findOne({_id: id}, function(err, data){
             if(err){
                return console.log(err);
             }
             kettle = data.toObject();
             kettle.powerOn = true;
             kettle.boiled = false;

             updateDB(KettleModel, kettle, 'powerOn');

             // очистка таймаута для устранения зациклинности
             clearTimeout(self.timers[kettle._id]);

             self.tick(kettle, targetDegree, isCold, defer);
        });

        return defer.promise;
    },

    // реализация кипения, так же охлаждения
    tick: function(kettle, targetDegree, isCold, defer){
        console.log(kettle.degree, targetDegree, isCold);
        if(isCold ? kettle.degree > targetDegree : kettle.degree < targetDegree){
            isCold ? kettle.degree-- : kettle.degree++;
            updateDB(KettleModel, kettle, 'degree');
            // привязка к айди чайника и управление его таймеров
            //bind(this) для выбора tick();
            this.timers[kettle._id.toString()] = setTimeout(this.tick.bind(this), 1000, kettle, targetDegree, isCold, defer);

        } else if(!isCold && kettle.degree == targetDegree) {
            console.log('cold', defer);
            defer.resolve(kettle.name);
            this.cold(kettle);
        }
    },

    cold: function(kettle) {
        if (kettle.degree > 0) {
            kettle.powerOn = false;
            kettle.boiled = true;

            updateDB(KettleModel, kettle, 'powerOn');


            this.tick(kettle, kettle.minDegree, true);
        }
    }
};

module.exports = kettleEngine;
