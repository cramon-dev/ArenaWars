/* 
	If a player isn't authenticated, don't save their stats. However, store their accumulated stats in a cookie.
	Let them know that if they register for an account, their current stats will be saved.
*/


var Player = function Player(username, isAuthenticated) {
	this.username = username;
	this.isAuthenticated = isAuthenticated;
}

Player.prototype = {
	getUsername: function() {
		return this.username;
	},

	isAuthenticated: function() {
		return this.isAuthenticated;
	}
}