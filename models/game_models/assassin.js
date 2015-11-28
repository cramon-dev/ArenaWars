var BaseCharacter = require('./baseCharacter.js');
var Skill = require('./skill.js');

var Assassin = function Assassin() {
	this.health = this.health; // Why do I need to do this every time? Quick fix
	this.resilience = this.resilience;
	this.strength = this.strength;
	this.critChance = this.critChance;
	this.critDamage = this.critDamage;
	this.weapon1 = null;
	this.weapon2 = null;
	this.mechanic = null;
}

Assassin.prototype = new BaseCharacter();
Assassin.prototype.constructor = Assassin;

Assassin.prototype.getHealth = function() {
	return this.health;
};

Assassin.prototype.getWeapon1 = function() {
	return this.weapon1;
};

Assassin.prototype.setWeapon1 = function(weaponToSet) {
	this.weapon1 = weaponToSet;
};

Assassin.prototype.getWeapon2 = function() {
	return this.weapon2;
};

Assassin.prototype.setWeapon2 = function(weaponToSet) {
	this.weapon2 = weaponToSet;
};

Assassin.prototype.getMechanic = function() {
	return this.mechanic;
};

Assassin.prototype.setMechanic = function(mechanicToSet) {
	this.mechanic = mechanicToSet;
};

module.exports = Assassin;