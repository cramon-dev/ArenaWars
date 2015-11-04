var BaseCharacter = require('./baseCharacter.js');
var Skill = require('./skill.js');

var Sorcerer = function Sorcerer() {
	this.health = this.health * 0.8;
	this.weapon = null;
	this.mechanic = null;
}

Sorcerer.prototype = new BaseCharacter();
Sorcerer.prototype.constructor = Sorcerer;

Sorcerer.prototype.getHealth = function() {
	return this.health;
};

Sorcerer.prototype.getWeapon = function() {
	return this.weapon;
};

Sorcerer.prototype.setWeapon = function(weaponToSet) {
	this.weapon = weaponToSet;
};

Sorcerer.prototype.getMechanic = function() {
	return this.mechanic;
};

Sorcerer.prototype.setMechanic = function(mechanicToSet) {
	this.mechanic = mechanicToSet;
};

module.exports = Sorcerer;