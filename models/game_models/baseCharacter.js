function BaseCharacter() {
	this.health = 5000;
	this.movementSpeed = 65;
	this.resilience = 5;
	this.strength = 5;
	this.critChance = .05;
	this.critDamage = 1.75;
	this.buffs = [];
	this.debuffs = [];
}

BaseCharacter.prototype = {
	getHealth: function() {
		return this.health;
	},

	getMoveSpeed: function() {
		return this.movementSpeed;
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
		return { health: this.health, resilience: this.resilience, strength: this.strength, 
			critChance: this.critChance, critDamage: this.critDamage };
	},

	setStats: function(strength, vitality, finesse) {
		this.health += vitality * 50;
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