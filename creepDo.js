var _ = require('lodash');
var math = require('math') ();
module.exports = function()
{
//declare base object
	var creepDo = function() {};
//-------------------------------------------------------------------------
	creepDo.standguard = function (creep){
		var targets = creep.room.find(Game.HOSTILE_CREEPS);
		if (targets.length) {
			var mytarget = creep.pos.findNearest(Game.HOSTILE_CREEPS);
			if (mytarget){
				if (creep.pos.inRangeTo(mytarget, 3)) {
				creep.rangedAttack(mytarget);
				}
				if (creep.pos.inRangeTo(mytarget, 2)) {
					creepDo.moveAwayFromTarget(creep, mytarget);
				}
				else {
					creep.moveTo(mytarget);
				}
			}
		}
		else if (creep.pos.inRangeTo(creepDo.findClosest(creep, Game.MY_SPAWNS), 3)) {
			creepDo.moveAwayFromTarget(creep, creepDo.findClosest(creep, Game.MY_SPAWNS));
		}
		else if (creep.pos.inRangeTo(creepDo.findClosest(creep, Game.MY_CREEPS), 2)) {
			creepDo.moveAwayFromTarget(creep, creepDo.findClosest(creep, Game.MY_CREEPS));
		}
		
	};
	creepDo.mharvest = function (creep)
	{
		if(creep.energy < creep.energyCapacity) {
			var sources = creep.pos.findNearest(Game.SOURCES);
			creep.moveTo(sources);
			creep.harvest(sources);
		}
		else {
			var target = creep.pos.findNearest(Game.MY_SPAWNS);
			creep.moveTo(target);
			creep.transferEnergy(target);
		}
	};
// sharvest causes creep to move to the nearest active source and begin collecting.
// designed for use with a harvester who drops energy to be collected by unit with collect method

	creepDo.sharvest = function (creep)
	{
		var source = creep.pos.findNearest(Game.SOURCES);
		if(source.energy) {
			creep.moveTo(source);
			creep.harvest(source);
			creep.dropEnergy();
		}
		else {
			console.log("All resources currently empty.");
		}
	};
// looks for closest dropped energy and collects it until full
	creepDo.collectEnergy = function (creep)
	{
		var dropped = creep.pos.findNearest(Game.DROPPED_ENERGY);
		creep.moveTo(dropped);
		creep.pickup(dropped);
	};

	creepDo.goToMySpawn = function (creep)
	{
	creep.moveTo(creep.pos.findNearest(Game.MY_SPAWNS));
	}
	
	
	creepDo.moveAwayFromTarget = function (creep, target)
	{
		var avoid = creep.pos.getDirectionTo(target);
		creep.move((avoid+4)%8);
	};
	
	creepDo.findClosest = function (creep, thingtype)
	{
		if (creep.room.find(thingtype).length) {
			var things = _.without(creep.room.find(thingtype), creep);
			var closest = things[0];
			var dist = 2000;
			for (var i in things) {
					if ( (math.abs((creep.pos.x - things[i].pos.x)) + math.abs((creep.pos.y - things[i].pos.y))) < dist){
					dist = math.abs((creep.pos.x - things[i].pos.x)) + math.abs((creep.pos.y - things[i].pos.y));
					closest = things[i];
				}
			}
		    return closest;
		}
		else {
			return creep.pos;
		}
	};
//-------------------------------------------------------------------------
//return populated object
return creepDo;
};


