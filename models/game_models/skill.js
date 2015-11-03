var Skill = function Skill(skillId, baseCd, available, castTime, isGroundTargeted) {
	this.id = skillId;
	this.baseCooldown = baseCd;
	this.isAvailable = available;
	this.castingTime = castTime;
	this.isGroundTargeted = isGroundTargeted;
	this.cooldownRate = 1;
}

Skill.prototype = {
	getId: function() {
		return this.id;
	},

	getBaseCooldown: function() {
		return this.baseCooldown;
	},

	isSkillAvailable: function() {
		return this.isAvailable;
	},

	getCastTime: function() {
		return this.castingTime;
	},

	isGroundTargeted: function() {
		return this.isGroundTargeted;
	}
}

module.exports = Skill;