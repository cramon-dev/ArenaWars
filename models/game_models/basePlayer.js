function BasePlayer() {
	this.health = 5000;
	this.movementSpeed = 65;
	this.buffs = [];
	this.debuffs = [];
}

BasePlayer.prototype = {
	getHealth: function() {
		return this.health;
	},

	getMoveSpeed: function() {
		return this.movementSpeed;
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


module.exports = BasePlayer;