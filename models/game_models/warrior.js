var BaseCharacter = require('./baseCharacter.js');
var Skill = require('./skill.js');

var Warrior = function Warrior() {
	this.health = this.health * 1.2;
	this.username = this.username;
	this.movementSpeed = this.movementSpeed;
	this.resilience = this.resilience;
	this.strength = this.strength;
	this.critChance = this.critChance;
	this.critDamage = this.critDamage;
	this.weapon1 = null;
	this.weapon2 = null;
	this.mechanic = null;
}

Warrior.prototype = new BaseCharacter();
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