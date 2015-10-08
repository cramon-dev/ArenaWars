var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var userSchema = mongoose.Schema({
	username: { type: String, required: true, unique: true },
	password: String,
	email: { type: String, required: true, unique: true },
	stats: {
		wins: Number,
		losses: Number,
		kills: Number,
		deaths: Number
	},
	resetPswdToken: String,
  	resetPswdTokenExpires: Date
});

// Generate a new hash
userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// Check if passwords match, used for authentication purposes
userSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);