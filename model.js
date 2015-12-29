var _ = require('lodash');
var proto = {
    boil: function(id, targetDegree, isCold){
        var kettle = _.findWhere(kettles, {id: id});
        kettle.powerOn = true;

        io.to(kettle.id).emit('change', JSON.stringify({
            name: 'powerOn',
            value: kettle.powerOn
        }));

        clearTimeout(kettle.timer);

        this.tick(kettle, targetDegree, isCold);
    },
    tick: function(kettle, targetDegree, isCold){
        console.log(kettle.degree, targetDegree, isCold)
        if(isCold ? kettle.degree > targetDegree : kettle.degree < targetDegree){
            isCold ? kettle.degree-- : kettle.degree++;

            io.to(kettle.id).emit('change', JSON.stringify({
                name: 'degree',
                value: kettle.degree
            }));

            kettle.timer = setTimeout(tick, 1000, kettle, targetDegree, isCold);
        } else if(!isCold && kettle.degree == targetDegree) {
            this.cold(kettle);
        }
    },
    cold: function(kettle) {
        if (kettle.degree > 0) {
            kettle.powerOn = false;
            io.to(kettle.id).emit('change', JSON.stringify({
                name: 'powerOn',
                value: kettle.powerOn
            }));

            io.to(kettle.id).emit('change', JSON.stringify({
                name: 'degree',
                value: kettle.degree
            }));

            this.tick(kettle, kettle.minDegree, true);
        }
    },
    toJSON: function(){

    }
};
function create(data){
    var obj = Object.create(proto);

    _.extend(obj, data);

    return obj;
}

module.exports = create;
