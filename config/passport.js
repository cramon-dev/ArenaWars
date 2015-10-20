var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user.js');
var dbManager = require('../models/db-manager.js');

module.exports = function(passport) {
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});


	passport.use('local-signin', new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	},
	function(req, username, password, done) {
		dbManager.getUser(username, function(err, user) {
			if(err) {
				return done(err);
			}

			if(!user) {
				console.log('No user found');
				return done(null, false, req.flash('signinMessage', 'That user does not exist.'));
			}

			if(!user.validPassword(password)) {
				console.log('Incorrect password');
				return done(null, false, req.flash('signinMessage', 'Your password was incorrect.'));
			}

			console.log('Success authenticating user');
			return done(null, user);
		});
	}));

	passport.use('local-register', new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	},
	function(req, username, password, done) {
		var email = req.body.email;
		dbManager.checkIfUserExists(username, email, function(err, user) {
			if(err) {
				return done(err);
			}

			if(user) {
				if(user.username == username) {
					return done(null, false, req.flash('registerMessage', 'That username is already taken.'));
				}
				else if(user.email == email) {
					return done(null, false, req.flash('registerMessage', 'That email is already in use.'));
				}
			}
			else {
				var newUser = new User();

				newUser.username = username;
				newUser.password = newUser.generateHash(password);
				newUser.email = email;
				newUser.stats = {
					wins: 0,
					losses: 0,
					kills: 0,
					deaths: 0
				};

				if(newUser.validUsername(username)) {
					dbManager.createUser(newUser, function(err) {
						if(err) {
							return done(err, null);
						}

						console.log('User successfully created with username: ' + username);
						return done(null, newUser);
					});
				}
				else {
					console.log('Invalid username: ' + username);
					return done({ status: 400, message: 'Improperly formatted username' });
				}
			}
		});
	}));
};