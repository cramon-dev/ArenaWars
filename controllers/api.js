var express = require('express');
var router = express.Router();
var passport = require('passport');
var util = require('util');
var dbManager = require('../models/db-manager.js');
var User = require('../models/user.js');

router.get('/', function(req, res, next) {
	res.render('api-home', { user: req.user, message: req.flash('apiError') });
});

router.get('/:username', function(req, res, next) {
	dbManager.getUser(req.params.username, function(err, user) {
		if(err) {
			return res.send(err);
		}

		if(!user) {
			return res.send('No user with that username found.');
		}

		res.json(user.stats);
	});
});

// Updates stats for a given user
router.put('/:username', isAuthorized, function(req, res, next) {
	dbManager.getUser(req.params.username, function(err, user) {
		var newStats = {};
		var battleWon = (req.body.battleWon == 'true') ? true : false;

		try {
			newStats.kills = parseInt(req.body.kills);
			newStats.deaths = parseInt(req.body.deaths);
			if(isNaN(newStats.kills) || isNaN(newStats.deaths)) {
				throw { message: 'Inputted data was not properly formatted' };
			}
		}
		catch(ex) {
			return res.send('Stats unsuccessfully updated for ' + req.params.username + '\nReason: ' + ex.message);
		}

		user.stats = {
			kills: user.stats.kills + newStats.kills,
			deaths: user.stats.deaths + newStats.deaths,
			wins: (battleWon ? user.stats.wins + 1 : user.stats.wins),
			losses: (!battleWon ? user.stats.losses + 1 : user.stats.losses)
		}

		dbManager.updateUser(user, function(err) {
			if(err) {
				return res.send(err);
			}

			res.send('Stats successfully updated for ' + req.params.username);
		});
	});
});


// Check if request has authorizations to access certain parts of the api
function isAuthorized(req, res, next) {
	console.log('Is request authorized');
	next();
}

module.exports = router;