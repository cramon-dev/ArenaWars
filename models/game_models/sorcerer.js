var BaseCharacter = require('./baseCharacter.js');
var Skill = require('./skill.js');

var Sorcerer = function Sorcerer() {
	this.health = this.health * 0.8;
	this.username = this.username;
	this.movementSpeed = this.movementSpeed;
	this.resilience = this.resilience;
	this.strength = this.strength;
	this.critChance = this.critChance;
	this.critDamage = this.critDamage;
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