var userSchema = mongoose.Schema({
	username: String,
	password: Number,
	userId: Number,
	email: Number
});

exports.User = mongoose.model('User', userSchema);