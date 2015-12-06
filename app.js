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
    var player1Pos = {x: 0, y: 25, z: -50};
    var player2Pos = {x: 0, y: 25, z: 70};

    console.log('Client connected to server');
    // winston.info(roomList);
    // var roomId;
    // for(var i in roomList) {
    //     for(var j in roomList[i].players) {
    //         roomId = 
    //     }
    // }
    // var room = _.findWhere(roomList, { })
    // io.to(client.id).emit('setClientId', { clientId: client.id, roomId: roomList });
    // socket.emit('setClientId', {})

    // Game handlers

    function monitorSkillCooldowns(data) {

    }

    function updatePosition(data) {
        console.log('Got update position');

        if(data.isPlayer1) {
            _.findWhere(roomList, { roomId: data.roomId }).getPlayers()[0].position = data.position;
        }
        else {
            _.findWhere(roomList, { roomId: data.roomId }).getPlayers()[1].position = data.position;
        }
        // data.isPlayer1 ? (player1.position = data.position) : (player2.position = data.position);
    }

    function playerHit(data) {
        console.log('player was hit');
        var room = _.findWhere(roomList, { roomId: data.roomId });

        _.findWhere(room.getPlayers(), { id: data.enemyId }).health -= data.damage;
    }

    function skillUsed(data) {
        console.log('skill was used');
        console.log(data);
        playerHit(data);
    }

    function gameOver(players) {
        // assuming players haven't disconnected
        if(players.length > 1) {
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

            if(winner) {
                return { gameOver: true, winner: winner, loser: loser };
            }
            else {
                return { gameOver: false };
            }
        }
        else {
            // if someone disconnects, the player who stayed automatically wins
            return { gameOver: true, winner: players[0] };
        }
    }

    function beginGame(room) {
        room.startGame();
        var players = room.getPlayers();
        players[0].setPosition(player1Pos);
        players[1].setPosition(player2Pos);

        io.emit('startGame', { player1: players[0], player2: players[1] });

        var gameLoop = setInterval(function() {
            var updatedPlayers = room.getPlayers();
            io.emit('updateClient', { player1: updatedPlayers[0], player2: updatedPlayers[1] });

            var results = gameOver(updatedPlayers);
            if(results.gameOver) {
                clearInterval(gameLoop);

                updateStats(results);

                console.log('GAME OVER');
                room.updateGameState(GameState.GAME_OVER);
                io.emit('gameOver', { text: 'Game over' });
            }
        }, refreshRate);
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

        // if client didn't disconnect before game ends, do something?

        if(results.winner) {
            var winnerUrl = 'http://localhost:3000/api/stats/' + results.winner.username;
            request(winnerUrl, {
                method: 'PUT',
                headers: { 'Authorization': 'Basic YWRtaW4xOjIwMDdkMWY3NWE5YzEwYzFkYTcwYjFiNTQ3NmVmMjhjZWNhNDk5YjA2N2M4MmM2OQ==', 'Content-Type': 'application/json' },
                json: winnerBody
            });
        }

        if(results.loser) {
            var loserUrl = 'http://localhost:3000/api/stats/' + results.loser.username;
            request(loserUrl, {
                method: 'PUT',
                headers: { 'Authorization': 'Basic YWRtaW4xOjIwMDdkMWY3NWE5YzEwYzFkYTcwYjFiNTQ3NmVmMjhjZWNhNDk5YjA2N2M4MmM2OQ==', 'Content-Type': 'application/json' },
                json: loserBody
            });
        }
    }


    // Socket.IO event listeners    

    client.on('searchForMatch', function(username) {
        for(var i in roomList) {
            if(roomList[i].getRoomState != RoomState.FULL) {
                roomList[i].addPlayer({ id: client.id, username: username, ready: false });
                winston.info('player joined room');
                break;
            }
        }
    });

    client.on('disconnect', function() {
        console.log('Client disconnected');
        for(var i in roomList) {
            if(roomList[i].removePlayer(client.id)) {
                roomList[i].updateRoomState();
                roomList[i].updateGameState(GameState.GAME_OVER);
                break;
            }
        }
    });

    client.on('startGame', function(data) {
        client.on('updatePosition', updatePosition);

        for(var i in roomList) {
            if(roomList[i].getRoomState != RoomState.EMPTY) {
                // var player = _.findWhere(roomList[i].players, { id: client.id });
                var player;

                switch(data.character) {
                    case "Warrior":
                        player = new Warrior();
                        player.setWeapon1(new Weapon(data.weapon1));
                        // player.setWeapon2(new Weapon(data.weapon2));
                        break;
                    case "Assassin":
                        player = new Assassin();
                        player.setWeapon1(new Weapon(data.weapon1));
                        // player.setWeapon2(new Weapon(data.weapon2));
                        break;
                    case "Sorcerer":
                        player = new Sorcerer();
                        player.setWeapon(data.weapon1);
                        break;
                    default:
                        player = new Warrior();
                        player.setWeapon1(new Weapon(data.weapon1));
                        // player.setWeapon2(new Weapon(data.weapon2));
                        break;
                }

                client.on('skillUsed', skillUsed);
                io.to(client.id).emit('setClientId', { clientId: client.id, roomId: roomList[i].getRoomId() });
                
                player.setUsername(data.username);
                player.setStats(data.stats.strength, data.stats.vitality, data.stats.finesse);
                roomList[i].setPlayer(client.id, player);

                roomList[i].togglePlayerReady(client.id);

                if(roomList[i].getAllPlayersReady()) {
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