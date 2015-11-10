var uuid = require('node-uuid');
var GameState = require('./gamestate.js');

var GameRoom = function GameRoom() {
	this.id = uuid.v4();
	this.players = [];
	this.state = GameState.IN_GAME_LOBBY;

	if(arguments.length > 0) {
		for(var player in arguments) {
			if(this.players.length < 2) {
				this.players.push(arguments[player]);
			}
		}
	}
}

GameRoom.prototype = {
	getGameRoomId: function() {
		return this.id;
	},

	getPlayers: function() {
		return this.players;
	},

	addSinglePlayer: function(player) {
		if(this.players.length < 2) {
			this.players.push(player);
		}
	},

	addPlayers: function(players) {
		this.players = players;
	},

	getGameRoomState: function() {
		return this.state;
	},

	startGame: function() {
		this.state = GAME_IN_PROGRESS;
	},

	endGame: function() {
		this.state = GAME_OVER;
	}
}

module.exports = GameRoom;