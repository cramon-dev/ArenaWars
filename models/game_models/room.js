var uuid = require('node-uuid');
var RoomState = require('./roomstate.js');

var Room = function Room() {
	this.roomId = uuid.v4();
	this.players = [];
	this.state = RoomState.EMPTY;
	
	// if player is provided, push them to the room and change room state
	if(arguments.length > 0) {
		console.log(arguments[0]);
		this.players.push(arguments[0]);
		this.state = RoomState.AVAILABLE;
	}
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
			else {
				this.state = RoomState.AVAILABLE;
			}
		}
	}
}

module.exports = Room;