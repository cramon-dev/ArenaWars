var RoomState = {
	EMPTY: "EMPTY",
	AVAILABLE: "AVAILABLE",
	FULL: "FULL",
	GAME_IN_PROGRESS: "GAME_IN_PROGRESS",
	GAME_OVER: "GAME_OVER"
};

module.exports = Object.freeze(RoomState); // Do this to make the object immutable