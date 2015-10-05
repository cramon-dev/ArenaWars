var passport = require('passport');
var express = require('express');
var bcrypt = require('bcryptjs');
var router = express.Router();

router.get('/', function(req, res, next) {
	res.send('Get sign in');
});

router.post('/', function(req, res, next) {
	res.send('Post sign in');
});