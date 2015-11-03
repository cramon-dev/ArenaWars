var uuid = require('node-uuid');
var RoomState = require('./roomstate.js');

var Room = function Room(player1, player2) {
	this.roomId = uuid.v4();
	this.players = [ player1, player2 ];
	this.state = RoomState.FULL;
}

Room.prototype = {
	getRoomId: function() {
		return this.roomId;
	},

	getPlayers: function() {
		return this.players;
	},

	getRoomState: function() {
		return this.state;
	},

	addPlayer: function(player) {
		if(this.state != RoomState.FULL) {
			this.players.push(player);
			if(this.players.length == 2) {
				this.state = RoomState.FULL;
			}
		}
	},
}

module.exports = Room;