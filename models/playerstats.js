var playerStatsSchema = mongoose.Schema({
	username: String,
	userId: Number,
	wins: Number,
	losses: Number,
	kills: Number,
	deaths: Number
});

exports.PlayerStats = mongoose.model('PlayerStats', playerStatsSchema);