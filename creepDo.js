var _ = require('lodash');
var math = require('math') ();
module.exports = function()
{
//declare base object
	var creepDo = function() {};
//-------------------------------------------------------------------------
	creepDo.rangedSeek1 = function (creep){
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
		else {
			creepDo.avoidClosest(creep, Game.MY_SPAWNS, 3);
			creepDo.avoidClosest(creep, Game.MY_CREEPS, 2);
		}
	};


	creepDo.mharvest1 = function (creep)
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


	creepDo.sharvest1 = function (creep)
	{
		var source = creepDo.rememberSpawnSource(creep);
		if (source){
			if (!creep.pos.isNearTo(source));{
				creep.moveTo(source);
			}
			if(source.energy) {
				creep.harvest(source);
			}
			else {
				console.log(creep.memory.homeSpawn + "'s source is dry.");
			}
		}
		else {
			console.log("Oh god, there are no sources here.  I'M AN ABOMINATION");
		}
	};
	
	
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------


// looks for closest dropped energy and collects it until full
	creepDo.collectEnergy = function (creep)
	{
		if (creep.energy < creep.energyCapacity){
			var dropped = creep.pos.findNearest(Game.DROPPED_ENERGY);
			creep.moveTo(dropped);
			creep.pickup(dropped);
		}
	};
	

	creepDo.bringEnergyHome = function (creep)
	{
	creep.moveTo(creep.pos.findNearest(Game.MY_SPAWNS));
	creep.transferEnergy(creep.pos.findNearest(Game.MY_SPAWNS));
	};
	
	
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
	
	creepDo.findClosestArray = function (creep, thingtype)
	{
		if (thingtype.length) {
			var things = _.without(thingtype, creep);
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
			return creep;
		}
	};
	
	creepDo.avoidClosest = function (creep, thingtype, distance)
	{
		if (creep.pos.inRangeTo(creepDo.findClosest(creep, thingtype), distance)) {
			creepDo.moveAwayFromTarget(creep, creepDo.findClosest(creep, thingtype));
	
		}
	};
	
	creepDo.rememberCreep = function (name)
	{
		for (var z in Game.creeps){
			if (Game.creeps[z].name == name){
				return Game.creeps[z];
			}
		}
	}
	
	creepDo.rememberSource = function (spawner)
	{
		for (var zz in spawner.room.find(Game.SOURCES)){
			if (spawner.memory.assignedSource == spawner.room.find(Game.SOURCES)[zz].id){
				return spawner.room.find(Game.SOURCES)[zz];
			}
		}
			
	}
	
	creepDo.rememberSpawner = function (creep)
	{
		for (var zzz in Game.spawns){
			if (Game.spawns[zzz].name == creep.memory.homeSpawn){
				return Game.spawns[zzz];
			}
		}
	}
	
	creepDo.rememberSpawnSource = function (creep)
	{
		return creepDo.rememberSource(creepDo.rememberSpawner(creep));
	}
	
	creepDo.calculateSpawnConstruction = function (creep)
	{
		var sources = creep.room.find(Game.SOURCES);
		var sourceLocations = [];
		var spawnLocations = [];
		var shortest = 1337
		
		// Find the two sources that are closest to each other, save their 
		// objects as sourceLocations[0] and [1] for later use.
		
		for (var a in sources){
			for (var aa in _.without(sources, sources[a])){
				if (sources[a].pos.findPath(sources[a].pos, sources[aa].pos, {ignoreCreeps: true}).length < shortest){
					shortest = sources[a].pos.findPath(sources[a].pos, sources[aa].pos, {ignoreCreeps: true}).length;
					sourceLocations[0] = source[a];
					sourceLocations[1] = source[aa];
				}
			}
		}
		
		// Find the halfway point between the two closest sources.
		// If it isn't 0, save it to spawnLocations[0] as a position object.
		var path = creep.room.findPath(sourceLocations[0].pos), sourceLocations[1].pos);
		var halfwayIndex = math.round(path.length)
		if (halfwayIndex > 1){
			spawnLocations[0] = getPositionAt(path[halwayIndex].x, path.y);
		}
		else {
			console.log("I have no idea what to do here yet. HEY PROGRAMMER, FIX ME!!")
		}
		
		// Find the halfway point between the two closest spawn points of the remaining 3
		
	}
//-------------------------------------------------------------------------
//return populated object
return creepDo;
};


