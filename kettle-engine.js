var _ = require('lodash');
var connection = require('./connection.js');
var KettleModel = require('./kettle-model.js');
var updateDB = require('./updateDB.js');
var kettleEngine;

kettleEngine = {

    //для корректной работы таймера
    timers: {},

    boil: function(kettles, id, targetDegree, isCold){

         var kettle,
             self = this;

         KettleModel.findOne({_id: id}, function(err, data){
             if(err){
                return console.log(err);
             }
             kettle = data.toObject();
             kettle.powerOn = true;

             updateDB(KettleModel, kettle, 'powerOn');

             // очистка таймаута для устранения зациклинности
             clearTimeout(self.timers[kettle._id]);

             self.tick(kettle, targetDegree, isCold);
        });
    },

    // реализация кипения, так же охлаждения
    tick: function(kettle, targetDegree, isCold){
        console.log(kettle.degree, targetDegree, isCold);
        if(isCold ? kettle.degree > targetDegree : kettle.degree < targetDegree){
            isCold ? kettle.degree-- : kettle.degree++;

            console.log(kettle);

            updateDB(KettleModel, kettle, 'degree');
            // привязка к айди чайника и управление его таймеров
            //bind(this) для выбора tick();
            this.timers[kettle._id.toString()] = setTimeout(this.tick.bind(this), 1000, kettle, targetDegree, isCold);

        } else if(!isCold && kettle.degree == targetDegree) {
            console.log('cold');
            this.cold(kettle);
        }
    },

    cold: function(kettle) {
        if (kettle.degree > 0) {
            kettle.powerOn = false;

            updateDB(KettleModel, kettle, 'powerOn');

            this.tick(kettle, kettle.minDegree, true);
        }
    }
};

module.exports = kettleEngine;
