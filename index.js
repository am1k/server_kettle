var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('lodash');
var fs = require('fs');

var kettles = [];
var information = [];


// для чтения файла необходимо вынести его как глобальную переменную, затем не нужно будет читать файлы по нескольку раз
kettles = JSON.parse(fs.readFileSync('./data.json', "utf8", function(err, data){
  if(err) throw err;
  socket.emit('getKettles', data);
}));


io.on('connection', function(socket){
  var currentId;

  // передача информации(конфигурационных данных)
  socket.on('getKettles', function(){
    socket.emit('getKettles', JSON.stringify(kettles));
  });


  // отвечает за созднаие каналов для чайников
  socket.on('changeKettle', function(id){
    currentId && socket.leave(currentId);
    socket.join(id);
    currentId = id;
  });

  // отвечает за ф-ционал чайников
  socket.on('boil', function(data){
    information = JSON.parse(data);
    boil( information.id,  information.targetDegree, information.isCold);
  })

});
http.listen(3000, function(){
  console.log('listening on *:3000');
});

function boil(id, targetDegree, isCold){
  var kettle = _.findWhere(kettles, {id: id});
  kettle.powerOn = true;

  io.to(kettle.id).emit('change', JSON.stringify({
    name: 'powerOn',
    value: kettle.powerOn
  }));

  clearTimeout(kettle.timer);

  tick(kettle, targetDegree, isCold);
}


// реализация кипения, так же охлаждения
function tick(kettle, targetDegree, isCold){
  console.log(kettle.degree, targetDegree, isCold)
  if(isCold ? kettle.degree > targetDegree : kettle.degree < targetDegree){
    isCold ? kettle.degree-- : kettle.degree++;

    io.to(kettle.id).emit('change', JSON.stringify({
      name: 'degree',
      value: kettle.degree,
    }));

    kettle.timer = setTimeout(tick, 1000, kettle, targetDegree, isCold);
  } else if(!isCold && kettle.degree == targetDegree) {
    console.log('cold')
    cold(kettle);
  }
}

function cold(kettle) {
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

    tick(kettle, kettle.minDegree, true);
  }
}

