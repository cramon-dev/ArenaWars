var express = require('express');
var Skill = require('../models/game_models/skill.js');
var Assassin = require('../models/game_models/assassin.js');
var Warrior = require('../models/game_models/warrior.js');
var Sorcerer = require('../models/game_models/sorcerer.js');
var Weapon = require('../models/game_models/weapon.js');
var sio = require('socket.io');
var winston = require('winston');
var router = express.Router();

router.get('/', function(req, res, next) {
	res.render('game', { user: req.user });
});

router.get('/test', function(req, res, next) {
	var player1 = new Assassin();
	var player2 = new Sorcerer();
	player1.setWeapon1(new Weapon('Dagger'));
	player1.setWeapon2(new Weapon('Rifle'));
	player2.setWeapon(new Weapon('Hammer'));
	var arr = [];
	arr.push(player1);
	arr.push(player2);
	res.send(arr);
});

module.exports = router;