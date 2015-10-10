var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var apiUserSchema = mongoose.Schema({
	username: { type: String, required: true, unique: true },
	password: String
});

// Generate a new hash
apiUserSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// Check if passwords match, used for authentication purposes
apiUserSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('ApiUser', apiUserSchema);