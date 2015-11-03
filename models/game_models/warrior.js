var BasePlayer = require('./basePlayer.js');
var Skill = require('./skill.js');

var Warrior = function Warrior() {
	this.health = this.health * 1.2;
	this.weapon1 = null;
	this.weapon2 = null;
	this.mechanic = null;
}

Warrior.prototype = new BasePlayer();
Warrior.prototype.constructor = Warrior();

Warrior.prototype.getHealth = function() {
	return this.health;
};

Warrior.prototype.getWeapon1 = function() {
	return this.weapon1;
};

Warrior.prototype.setWeapon1 = function(weaponToSet) {
	this.weapon1 = weaponToSet;
};

Warrior.prototype.getWeapon2 = function() {
	return this.weapon2;
};

Warrior.prototype.setWeapon2 = function(weaponToSet) {
	this.weapon2 = weaponToSet;
};

Warrior.prototype.getMechanic = function() {
	return this.mechanic;
};

Warrior.prototype.setMechanic = function(mechanicToSet) {
	this.mechanic = mechanicToSet;
};

module.exports = Warrior;