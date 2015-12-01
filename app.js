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
var request = require('request');
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
var refreshRate = 1000;
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


// Game logic

io.on('connection', function(client) {
    console.log('Client connected to server');
    winston.info(roomList);
    io.to(client.id).emit('setClientId', { id: client.id });
    // socket.emit('setClientId', {})

    // Game handlers

    function gameOver(players) {
        var winner = null;
        var loser = null;

        if(players[0].health <= 0) {
            winner = players[1];
            loser = players[0];
        }

        if(players[1].health <= 0) {
            winner = players[0];
            loser = players[1];
        }

        console.log('Player 1 health: ' + players[0].health);
        console.log('Player 2 health: ' + players[1].health);
        // for(var i in players) {
        //     console.log('Player health: ' + players[i].getHealth());
        //     if(players[i].getHealth() <= 0) {
        //         gameOver = true;
        //     }
        // }

        if(winner) {
            return { gameOver: true, winner: winner, loser: loser };
        }
        else {
            return { gameOver: false };
        }
    }

    function beginGame(room) {
        room.startGame();
        var players = room.getPlayers();
        io.emit('startGame', { player1: players[0], player2: players[1] });
        winston.info(players[0]);

        // var gameLoop = setInterval(function() {
        //     io.emit('updateClient', { player1: players[0], player2: players[0] });

        //     // room.removeHealth(0, 1000);
            
        //     var results = gameOver(players);
        //     if(results.gameOver) {
        //         clearInterval(this);

        //         updateStats(results);

        //         console.log('GAME OVER');
        //         room.updateGameState(GameState.GAME_OVER);
        //         io.emit('gameOver', { text: 'Game over' });
        //     }
        // }, refreshRate);
    }

    function updateStats(results) {
        winston.info(results);

        var winnerBody = {
            kills: 1,
            deaths: 0,
            battleWon: true
        };

        var loserBody = {
            kills: 0,
            deaths: 1,
            battleWon: false
        };

        var winnerUrl = 'http://localhost:3000/api/stats/' + results.winner.username;
        var loserUrl = 'http://localhost:3000/api/stats/' + results.loser.username;

        request(winnerUrl, {
            method: 'PUT',
            headers: { 'Authorization': 'Basic YWRtaW4xOjIwMDdkMWY3NWE5YzEwYzFkYTcwYjFiNTQ3NmVmMjhjZWNhNDk5YjA2N2M4MmM2OQ==', 'Content-Type': 'application/json' },
            json: winnerBody
        });

        request(loserUrl, {
            method: 'PUT',
            headers: { 'Authorization': 'Basic YWRtaW4xOjIwMDdkMWY3NWE5YzEwYzFkYTcwYjFiNTQ3NmVmMjhjZWNhNDk5YjA2N2M4MmM2OQ==', 'Content-Type': 'application/json' },
            json: loserBody
        });
    }


    // Socket.IO event listeners

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
        if(data.enemyHit) {
            console.log('Player hit enemy ' + data.enemy);
        }
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
                
                var player = new Assassin();
                player.setWeapon1(new Weapon('Dagger'));
                player.setWeapon2(new Weapon('Rifle'));
                // player.setStats(30, 30, 30);
                // player.setStats(40, 0, 50);
                roomList[i].setPlayer(client.id, player);
                winston.info(player.getStats());

                roomList[i].togglePlayerReady(client.id);

                if(roomList[i].getAllPlayersReady()) {
                    console.log('Start game');
                    // io.emit('statusMessage', { text: 'Fight!' });
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