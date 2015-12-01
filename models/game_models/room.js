var uuid = require('node-uuid');
var RoomState = require('./roomstate.js');
var GameState = require('./gamestate.js');

var Room = function Room() {
	this.roomId = uuid.v4();
	this.players = [];
	this.roomState = RoomState.EMPTY;
	this.gameState = GameState.IN_GAME_LOBBY;
	
	// if player is provided, push them to the room and change room state
	if(arguments.length > 0) {
		console.log(arguments);
		for(var i in arguments) {
			if(this.players.length < 2) {
				this.players.push(arguments[i]);
			}
		}

		this.updateRoomState();
	}
}

Room.prototype = {
	getRoomId: function() {
		return this.roomId;
	},

	getSinglePlayer: function(id) {
		for(var i in this.players) {
			if(this.players[i].id == id) {
				return this.players[i];
			}
		}
	},

	getPlayers: function() {
		return this.players;
	},

	getAllPlayersReady: function() {
		var numReady = 0;
		for(var i in this.players) {
			if(this.players[i].ready) {
				numReady += 1;
			}
		}

		console.log('Number of players ready: ' + numReady);
		return numReady == 2; // just make sure that two players are ready for now, because it's only a two player game
	},

	togglePlayerReady: function(id) {
		for(var i in this.players) {
			if(this.players[i].id == id) {
				if(this.players[i].ready) {
					console.log('make a new variable for this player');
					this.players[i].ready = true;
				}
				else {
					this.players[i].ready = !this.players[i].ready;
				}

				console.log(this.players[i]);
			}
		}
	},

	getRoomState: function() {
		return this.roomState;
	},

	getGameState: function() {
		return this.gameState;
	},

	addPlayer: function(player) {
		if(this.roomState != RoomState.FULL) {
			this.players.push(player);

			this.updateRoomState();
		}
	},

	setPlayer: function(id, player) {
		for(var i in this.players) {
			if(this.players[i].id == id) {
				this.players[i] = player;
				this.players[i].id = id;
				// this.players[i].username = username;
			}
		}
	},

	removePlayer: function(id) {
		for(var i in this.players) {
			if(this.players[i].id == id) {
				this.players.splice(i);
			}
		}

		this.updateRoomState();
		return true;
	},

	removeAllPlayers: function() {
		this.players = [];
		this.roomState = RoomState.EMPTY;
	},

	startGame: function() {
		this.gameState = GameState.GAME_IN_PROGRESS;
	},

	updateRoomState: function() {
		if(this.players.length == 0) {
			this.roomState = RoomState.EMPTY;
		}
		else if(this.players.length == 1) {
			this.roomState = RoomState.AVAILABLE;
		}
		else if(this.players.length == 2) {
			this.roomState = RoomState.FULL;
		}
	},

	updateGameState: function(newGameState) {
		this.gameState = newGameState;
	},

	removeHealth: function(index, health) {
		this.players[index].health -= health;
	},

	resetGameState: function() {
		this.gameState = GameState.IN_GAME_LOBBY;
	}
}

module.exports = Room;