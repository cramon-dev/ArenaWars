var mongoose = require('mongoose');
var util = require('util');
mongoose.connect('mongodb://localhost/data');
var User = require('./user.js');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function(callback) {
    console.log('Connection with database successfully opened');
});


exports.createUser = function(user, callback) {
	user.save(function(err, user) {
		callback(err, user);
	});
}

exports.getUser = function(username, callback) {
	User.findOne({ username: username }, function(err, user) {
		callback(err, user);
	});
}

exports.updateUser = function(user, callback) {
	user.save(function(err) {
		callback(err);
	});
}

exports.deleteUser = function(username, callback) {
	User.remove({ username: username }, function(err) {
		callback(err, 'No errors deleting user');
	});
}


// Find a user for the purposes of registration
exports.checkIfUserExists = function(username, email, callback) {
	User.findOne({ username: username, email: email }, function(err, user) {
		callback(err, user);
	});
}


// Password reset functions

exports.updateUserToken = function(user, callback) {
	console.log('Add a password reset token to a user\'s account');
	User.update({ username: user.username }, 
		{ $set: { resetPswdToken: user.resetPswdToken, 
			resetPswdTokenExpires: user.resetPswdTokenExpires } }, function(err) {
		callback(err);
	});
}

exports.updatePassword = function(user, callback) {
	var newPassword = new User().generateHash(user.password);

	user.password = newPassword;
	user.resetPswdToken = undefined;
	user.resetPswdTokenExpires = undefined;

	user.save(function(err) {
		callback(err);
	});
}

exports.getUserByEmail = function(email, callback) {
	User.findOne({ email: email }, function(err, user) {
		callback(err, user);
	});
}

exports.getUserByToken = function(token, callback) {
	User.findOne({ resetPswdToken: token, resetPswdTokenExpires: { $gt: Date.now() }}, function(err, user) {
		callback(err, user);
	});
}

exports.setResetToken = function(user, callback) {
	user.save(function(err) {
		callback(err);
	});
}