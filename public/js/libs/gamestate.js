var GameState = {
	IN_MENU: "IN_MENU",
	IN_MATCHMAKING: "IN_MATCHMAKING",
	IN_GAME_LOBBY: "IN_GAME_LOBBY",
	GAME_IN_PROGRESS: "GAME_IN_PROGRESS",
	GAME_OVER: "GAME_OVER"
};

// Make the object immutable
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	module.exports = Object.freeze(GameState);
}
else {
	window.GameState = Object.freeze(GameState);
}