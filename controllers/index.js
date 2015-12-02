var express = require('express');
var router = express.Router();
var passport = require('passport');
var dbManager = require('../models/db-manager.js');
var util = require('util');


router.get('/', function(req, res, next) {
	if(!req.user) {
		res.render('index', { title: 'Arena Wars', message: req.flash('message') });
	}
	else {
		res.redirect('/game');
	}
});

router.get('/home', isAuthenticated, function(req, res, next) {
	res.render('home', { user: req.user, message: req.flash('message') });
});

router.get('/signout', function(req, res, next) {
	req.session = null;
	res.status(302);
	res.redirect('/');
});


// Sign in routes

router.get('/signin', function(req, res, next) {
	res.render('signin', { message: req.flash('signinMessage') });
});

router.post('/signin', passport.authenticate('local-signin', {
    successRedirect : '/game', // redirect to the secure profile section
    failureRedirect : '/signin', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));


// Register routes

router.get('/register', function(req, res, next) {
	res.render('register', { message: req.flash('registerMessage')} );
});

router.post('/register', passport.authenticate('local-register', {
    successRedirect : '/home', // redirect to the secure profile section
    failureRedirect : '/register', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));



// Extension methods

function isAuthenticated(req, res, next) {
	if(req.isAuthenticated()) {
		return next();
	}

	res.redirect('/');
}


// Testing purposes

// router.get('/testCreateUser', function(req, res, next) {
// 	var stats = {
// 		wins: 0,
// 		losses: 0,
// 		kills: 0,
// 		deaths: 0
// 	};

// 	var newUser = { username: 'cramon',
// 		password: 'asdf',
// 		email: 'christianr465@gmail.com',
// 		stats: stats
// 	};

// 	dbManager.createUser(newUser, function(err, message) {
// 		if(!err) {
// 			res.send(message);
// 		}
// 		else {
// 			res.send(err);
// 		}
// 	});
// });

// router.get('/testGetUser', function(req, res, next) {
// 	var username = 'cramon';

// 	dbManager.getUser(username, function(err, user) {
// 		if(!err) {
// 			res.send(user);
// 		}
// 		else {
// 			res.send(err);
// 		}
// 	});
// });

// router.get('/testGetUser/:username', function(req, res, next) {
// 	dbManager.getUser(req.params.username, function(err, user) {
// 		if(!err) {
// 			if(user) {
// 				res.send(user);
// 			}
// 			else {
// 				res.send('User with username \'' + req.params.username + '\' was not found');
// 			}
// 		}
// 		else {
// 			res.send(err);
// 		}
// 	});
// });

// router.get('/testDeleteUser', function(req, res, next) {
// 	var username = 'cramon';

// 	dbManager.deleteUser(username, function(err, message) {
// 		if(!err) {
// 			res.send(message);
// 		}
// 		else {
// 			res.send(err);
// 		}
// 	});
// });

router.get('/testDeleteUser/:username', function(req, res, next) {
	dbManager.deleteUser(req.params.username, function(err, message) {
		if(!err) {
			res.send(message);
		}
		else {
			res.send(err);
		}
	});
});

module.exports = router;