var express = require('express')
var path = require('path');
var app = module.exports = express.createServer();
var io = require('socket.io')(app);
var port = process.env.PORT || 3000;
var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",//!!!
    database: "checkers"
});

app.configure(function(){
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.static(path.join(__dirname, 'public')));
});

var public_dir = './public/';

app.get('/', function(req, res) {
    res.sendFile(public_dir + 'index.html');
});

app.listen(port, function(){
  console.log("Включился", app.address().port);
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});



var flag = false;
var freeroom;
var userHost;
var serverUsers = {};
var clientUsers = {};
var conRoom;
var userteam = {};
var inroomuser = {};
var rooms = {};
var startgame;
var openroom = false;

function joinRoom(socket, room, username) {

  if (flag || openroom) {
    socket.join(freeroom);
    iduser = room;
    userteam[iduser] = 2;
    rooms[room] = freeroom;
    startgame = 1;
    openroom = false;
	
    socket.emit('joinResult', {room: rooms[room], userHost: userHost, userteam: userteam[iduser]});
	
	
	socket.emit('userteam', {room: rooms[room], iduser: iduser});
    socket.broadcast.to(freeroom).emit('startgame', {startgame: startgame});

	
	socket.broadcast.to(freeroom).emit('userconnecttoroom', {user2: username});
	
	console.log(username + ' - черные');
    flag = false;
    clientUsers[freeroom] = username;
    inroomuser[freeroom] = 2;

  } else {
    socket.join(room);
    iduser = room;
    userteam[iduser] = 1;
    flag = true;
    freeroom = room;
    rooms[room] = room;
    userHost = username;
    serverUsers[room] = username;
    inroomuser[freeroom] = 1;
    openroom = true;

	socket.emit('joinResult', {room: room, userHost: serverUsers[room], userteam: userteam[iduser]});
	
	socket.emit('userteam', {room: rooms[room], iduser: iduser});
    console.log(username + ' - белые');
  }

  if (inroomuser[conRoom] == 2) {
    console.log('Хозяин комнаты ' + conRoom + ': ' + serverUsers[conRoom]);
  }
}

var usernames = {};
var numUsers = 0;
var currentRoom = {};

io.on('connection', function(socket){

  var ID = (socket.id).toString();

  socket.on('disconnect', function () {

    if ((serverUsers[rooms[ID]] == socket.username) && (usernames[socket.username] = socket.username)){
      console.log('Вышел первый');
      flag = false;
    }
    if ((clientUsers[rooms[ID]] == socket.username) && (usernames[socket.username] = socket.username) ){
      console.log('Вышел второй.');
      flag = false;
    }
	
	console.log('Отключился: ' + ID);

    if (addedUser) {
     delete usernames[socket.username];
      --numUsers;
    }

  });

  var addedUser = false;

  //!!
  socket.on('rating', function(){
		var sql1 = "SELECT * FROM users";
		var res;
		queryRating(sql1,null, function (result) {
			socket.emit('ratingResp',result)
		});	  
  });
  
  socket.on('giveup',function(){
	  var ID = (socket.id).toString();
		console.log('Сдался: ' + ID);
		//если был соперник, то сопернику присваиваем победу updateRating(id пользователя соперника); 
  });
  
  socket.on('gameend',function(color){
		console.log('Победили: ' + color);
		//обновить рейтинг и может еще как то нужно показать что игра у этой пары кончилась
  });
  //!!
  
  socket.on('shodiltouser', function(data){
	  socket.broadcast.to(rooms[ID]).emit('movesbyserver', {moves_from_start: data.moves_from_start, checkers: data.checkers});
  });

  socket.on('register', function (user) {
      var sql = "INSERT INTO users(login, password) VALUES(?,?)";
      var sql1 = "SELECT * FROM users WHERE login = ?"
      var login = user.login;
      var password = user.password;
      console.log(login);
      console.log(password);
      query(sql1, login, null, function (result) {
          if (!result){
              queryInsert(sql, login, password, function (result) {
                  socket.emit('registerresp', true);
              });
          }
          else {
              socket.emit('registerresp', false);
          }

      });
  });

  socket.on('auth user', function (user) {
      var sql = "SELECT login, password FROM users WHERE login = ? AND password = ?";
      var result;
      var login = user.login;
      var password = user.password;
      console.log(login);
      console.log(password);
      if (login in usernames){
          result = false;
          socket.emit('loginresp', result);
      } else {
          query(sql, login, password, function (result) {
              console.log(result);
              socket.username = login;
              socket.emit('loginresp', result);
          });
      }

  });
 
  socket.on('add user', function (login) {
      login = socket.username;
      console.log(login);
      usernames[login] = login;
      ++numUsers;

      var time = (new Date).toLocaleTimeString();
      console.log('Подключился ' + ID + ' в ' + time);
      console.log('Ник ' + login);
      joinRoom(socket, ID, login);
      console.log('Всего онлайн: ' + numUsers);

      addedUser = true;
    });
});

//!!!!!
function updateRating(id){
	var sql = "UPDATE users SET rating =? WHERE id = ?";
    var sql1 = "SELECT rating FROM users WHERE id = ?";
	queryRating(sql1,id,function (result){
		var res = ++result.rating;
		queryInsert(sql,res,id,function (result){
			con.log(result);
		});
	});
}

function queryRating(sql, id,  callback) {
    con.query(sql, [id], function (error, results, fields) {
        if (error) {
            //
        }
        if (results.length > 0) {
            console.log(results);
            callback(results);
        }
    });
};
//!!!!

function query(sql, log, pass,  callback) {
    con.query(sql, [log, pass], function (error, results, fields) {
        if (error) {
            //
        }
        if (results.length > 0) {
            console.log(results);
            callback(true);
        }
        else{
            callback(false);
        }
    });
};
 
function queryInsert(sql, log, pass,  callback) {
    con.query(sql, [log, pass], function (error, results, fields) {
        if (error) {
            callback(false);
        }
        if (results.affectedRows > 0) {
            console.log(results);
            callback(true);
        }
        else {
            callback(false);
        }
    })
};



