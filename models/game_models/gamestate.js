var GameState = {
	IN_MENU: "IN_MENU",
	IN_MATCHMAKING: "IN_MATCHMAKING",
	IN_GAME_LOBBY: "IN_GAME_LOBBY",
	GAME_IN_PROGRESS: "GAME_IN_PROGRESS",
	GAME_OVER: "GAME_OVER"
};

module.exports = Object.freeze(GameState); // Do this to make the object immutable