var express = require('express');
var router = express.Router();
var passport = require('passport');
var crypto = require('crypto');
var async = require('async');
var nodemailer = require('nodemailer');
var dbManager = require('../models/db-manager.js');
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'christianr465@gmail.com',
        pass: 'unaxnwgrztjbtphk'
    }
});


router.get('/forgot', function(req, res, next) {
	res.render('forgot', { message: req.flash('forgotPswdMessage') });
});

router.post('/forgot', function(req, res, next) {
	// Use this to avoid callback hell
	async.waterfall([
		// Create secure token with crypto
		function(done) {
			crypto.randomBytes(24, function(err, buf) {
				var token = buf.toString('hex');
				done(err, token);
			});
		},
		// Look for user with the requested email, and if user is found, set the user's token and token expiration date
		function(token, done) {
			dbManager.getUserByEmail(req.body.email, function(err, user) {
				if(!user) {
					req.flash('forgotPswdMessage', 'No account with that email exists.');
					return res.redirect('/recover/forgot');
				}

				user.resetPswdToken = token;
				user.resetPswdTokenExpires = Date.now() + 3600000; // One hour from now

				dbManager.updateUserToken(user, function(err) {
					done(err, token, user);
				});
			});
		},
		// Compose an email and send it to the user with the password reset token
		function(token, user, done) {
			var mailOptions = {
				to: user.email,
				from: 'Account Recovery <accountrecovery@arenawars.com>',
				subject: 'Password Reset',
				text: 'You are receiving this email because you, or somebody else, has requested their password to be reset.\n\n'
				+ 'Please click on the following link, or paste this into your browser to reset your password:\n\n' +
	            'http://' + req.headers.host + '/recover/reset/' + token + '\n\n' +
	            'If you did not request your password to be reset, please ignore this email.\n'
			}
			transporter.sendMail(mailOptions, function(err) {
				req.flash('forgotPswdMessage', 'An email has been sent to ' + user.email + ' with instructions.');
				done(err, 'done');
			});
		}
	], function(err) {
		if(err) {
			return next(err);
		}

		res.redirect('/recover/forgot');
	});
});

router.get('/reset/:token', function(req, res, next) {
	dbManager.getUserByToken(req.params.token, function(err, user) {
		if(!user) {
			req.flash('forgotPswdMessage', 'Password reset token is invalid or has expired.');
			return res.redirect('/recover/forgot');
		}

		res.render('reset', { user: user, message: req.flash('resetPswdMessage') }); // try req.user in place of user?
	});
});

router.post('/reset/:token', function(req, res, next) {
	// Use this to avoid callback hell once again
	async.waterfall([
		function(done) {
			dbManager.getUserByToken(req.params.token, function(err, user) {
				if(!user) {
					req.flash('forgotPswdMessage', 'Password reset token is invalid or has expired.');
					return res.redirect('back');
				}

				if(req.body.confirmPassword != req.body.password) {
					req.flash('resetPswdMessage', 'Confirmed password field does not match the newly entered password.');
					return res.redirect('back');
				}

				user.password = req.body.password;
				user.resetPswdToken = undefined;
				user.resetPswdTokenExpires = undefined;

				dbManager.updatePassword(user, function(err) {
					console.log('Password reset successfully for: ' + user.username);
					req.flash('message', 'Your password has successfully been reset.');
					// req.logIn should be an automatic process by passport..
					req.logIn(user, function(err) {
						done(err, user);
					});
				});
			});
		},
		function(user, done) {
			var mailOptions = {
				to: user.email,
				from: 'Account Recovery <accountrecovery@arenawars.com>',
				subject: 'Successful Password Reset',
				text: 'You are receiving this email because the password for your Arena Wars account ' + user.email +
				' has just been changed.'
			}
			transporter.sendMail(mailOptions, function(err) {
				req.flash('resetPswdSuccess', 'Your password has been successfully reset.');
				done(err);
			});
		}
	], function(err) {
		res.redirect('/');
	});
});

module.exports = router;