function BaseCharacter() {
	this.maxHealth = 5000;
	this.health = this.maxHealth;
	this.username = null;
	this.movementSpeed = .95;
	this.position = {};
	this.resilience = 5;
	this.strength = 5;
	this.critChance = .05;
	this.critDamage = 1.75;
	this.buffs = [];
	this.debuffs = [];
}

BaseCharacter.prototype = {
	getMaxHealth: function() {
		return this.maxHealth;
	},

	getHealth: function() {
		return this.health;
	},

	getUsername: function() {
		return this.username;
	},

	setUsername: function(username) {
		this.username = username;
	},

	getMoveSpeed: function() {
		return this.movementSpeed;
	},

	getPosition: function() {
		return this.position;
	},

	setPosition: function(data) {
		this.position = data;
	},

	getResilience: function() {
		return this.resilience;
	},

	getStrength: function() {
		return this.strength;
	},

	getCritChance: function() {
		return this.critChance;
	},

	getCritDamage: function() {
		return this.critDamage;
	},

	getStats: function() {
		return { maxHealth: this.maxHealth, health: this.health, 
			movementSpeed: this.movementSpeed, resilience: this.resilience, strength: this.strength, 
				critChance: this.critChance, critDamage: this.critDamage };
	},

	setStats: function(strength, vitality, finesse) {
		this.maxHealth += vitality * 50;
		this.health = this.maxHealth;
		this.resilience += vitality * 2;
		this.strength += strength;
		this.critChance += (finesse / 100);
		this.critDamage += (finesse / 100) * .5;
	},

	getBuffs: function() {
		return this.buffs;
	},

	getDebuffs: function() {
		return this.debuffs;
	},

	addBuff: function(buff) {
		this.buffs.push(buff);
	},

	addDebuff: function(debuff) {
		this.debuffs.push(debuff);
	}
}


module.exports = BaseCharacter;