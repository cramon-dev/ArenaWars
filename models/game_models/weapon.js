var Skill = require('./skill.js');

var Weapon = function Weapon(weaponType) {
	this.weaponType = weaponType;
	this.skill1 = null;
	this.skill2 = null;
	this.skill3 = null;
}

Weapon.prototype = {
	getWeaponType: function() {
		return this.weaponType;
	},

	getSkill1: function() {
		return this.skill1;
	},

	getSkill2: function() {
		return this.skill2;
	},

	getSkill3: function() {
		return this.skill3;
	}
}

module.exports = Weapon;