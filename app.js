var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var session = require('cookie-session');
var passport = require('passport');
var flash = require('connect-flash');
var winston = require('winston');
var _ = require('underscore');
var app = express();

// Game dependencies
var http = require('http');
var server = http.createServer(app);
var Room = require('./models/game_models/room.js');
var RoomState = require('./models/game_models/roomstate.js');
var GameState = require('./models/game_models/gamestate.js');
var Assassin = require('./models/game_models/assassin.js');
var Warrior = require('./models/game_models/warrior.js');
var Sorcerer = require('./models/game_models/sorcerer.js');
var Buff = require('./models/game_models/buff.js');
var Debuff = require('./models/game_models/debuff.js');
var Weapon = require('./models/game_models/weapon.js');
var Skill = require('./models/game_models/skill.js');
var io = require('socket.io').listen(server);
server.listen(80);
var roomList = [ new Room(), new Room(), new Room() ];


// Set up routes
var index = require('./controllers/index');
var users = require('./controllers/users');
var recovery = require('./controllers/recover');
var api = require('./controllers/api');
var game = require('./controllers/game');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const secretToken = crypto.randomBytes(32).toString('hex');
// passport setup
app.use(session({ secret: secretToken, cookie: { maxAge: 60 * 60 * 6 } })); // Max age is 6 hours
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
require('./config/passport')(passport);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/recover', recovery);
app.use('/api', api);
app.use('/game', game);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


winston.info(roomList);

// Game handlers

function beginGame(room) {
    room.startGame();
    setInterval(function() {
        io.emit('updateClient', { text: 'update' });
    }, 1000);
}

io.on('connection', function(client) {
    console.log('Client connected to server');

    winston.info(roomList);

    // var room = new Room({ id: 1001 }, { id: 1002 });
    // winston.info(room);

    client.on('searchForMatch', function(username) {
        // var allRoomsFull = true;
        for(var i in roomList) {
            if(roomList[i].getRoomState != RoomState.FULL) {
                roomList[i].addPlayer({ id: client.id, username: username, ready: false });
                console.log('player joined room');
                winston.info(roomList[i]);
                // allRoomsFull = false;
                break;
            }
        }

        // some check to see if all rooms are full
        // roomList.push(new Room(data));

        // winston.info(roomList);

        // console.log(roomList);

        // console.log('No available room found, creating a new room');
        // // Assuming no empty room was found, create a new one and place the player in it.
        // roomList.push(new Room());
        // roomList[roomList.length - 1].addPlayer(data);
        // winston.info(roomList[roomList.length - 1]);

        // io.emit('statusMessage', { text: 'Waiting for opponent..' });
    });

    client.on('playerMoved', function(data) {
        io.emit('statusMessage', { text: 'Player moved' });
        console.log('Player moved');
        winston.info(data);
    });

    client.on('playerUseSkill', function(data) {
        console.log('Player used skill');
        winston.info(data);
    });

    client.on('disconnect', function() {
        console.log('Client disconnected');
        for(var i in roomList) {
            if(roomList[i].removePlayer(client.id)) {
                break;
            }
        }

        winston.info(roomList);
    });

    client.on('modifyCharacter', function(data) {
        // somewhere here modify the character the player is using
    });

    client.on('startGame', function(data) {
        for(var i in roomList) {
            if(roomList[i].getRoomState != RoomState.EMPTY) {
                // var player = _.findWhere(roomList[i].players, { id: client.id });
                
                roomList[i].togglePlayerReady(client.id);

                if(roomList[i].getAllPlayersReady()) {
                    console.log('Start game');
                    io.emit('statusMessage', { text: 'Fight!' });
                    beginGame(roomList[i]);
                }
                else {
                    console.log('Not all players are ready yet');
                }

                break;
            }
        }
    });
});


module.exports = app;