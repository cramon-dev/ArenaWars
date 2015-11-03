/*
	Buffs
	-Invisibility: You cannot be seen by your enemies while this is active. (Make trait extend the duration or possibly give it to allies?)
	-Invigorated: The cooldown of your next attack is decreased by 25%.
	-Evasion: Attacks do no damage to you.
	-Empowered: Gain a x% damage bonus, where x is dependent on the number of stacks applied (or abilities/traits used?).
	-Resolute: Gain a x% damage reduction, where x is dependent on the number of stacks applied.
	-Regeneration: Regenerate x amount of health per second, where x is dependent on the user's vitality.
	-Agility: Movement speed is increased by 25%.

	Debuffs

	-Weakness: Your outgoing damage is reduced and cooldown reduction rate is increased by 10% while active.
	-Burning: You are damaged every second and take 5% more damage while active.
	-Bleeding: You are damaged every second and your movement speed is reduced by 5% while active.
	-Poisoned: You are damaged every second and your cooldown reduction rate is decreased by 10% while active.
	-Frostbite: Your movement speed is reduced by 50% and your cooldown reduction rate is increased by 25% while active.
	-Rooted: You are unable to move while this is active.
	-Stunned: You are unable to move and cannot use any skills while this is active, with the exception of stun breaking skills.
*/

var Buff = function Buff(effectId, duration, stacks) {
	this.id = effectId;
	this.duration = duration;
	this.stacks = stacks;
}

Buff.prototype = {
	getEffectId: function() {
		return this.id;
	}

	getTotalDuration: function() {
		return this.duration;
	}

	getStacks: function() {
		return this.stacks;
	}
}

module.exports = Buff;