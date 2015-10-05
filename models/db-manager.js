var mongoose = require('mongoose');
var util = require('util');
mongoose.connect('mongodb://localhost/data');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function(callback) {
    console.log('Connection with database successfully opened');
});

exports.createUser = function(username, password, email) {
	console.log('Create user');
}

exports.getUser = function(userId) {
	console.log('Get user');
}