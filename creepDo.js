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
		// objects as sourceLocations[0] and [1] for later use. shortest
		// is initialized to "1337" since it will always be higher than the length of
		// the path.
		
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
		var path = creep.room.findPath(sourceLocations[0].pos), sourceLocations[1].pos, {ignoreCreeps: true});
		var halfwayIndex = math.round(path.length/2);
		if (halfwayIndex > 1){
			spawnLocations[0] = creep.room.getPositionAt(path[halwayIndex].x, path[halfwayIndex].y);
		}
		else {
			console.log("I have no idea what to do here yet. HEY PROGRAMMER, FIX ME!!")
		}

		
		// Subtract the two sources we just found from the variable sources
		// since we don't need them anymore and we want to compare the remaining 3
		for (var b in sources){
			if (sources[b] == sourceLocations[0]){
				sources.splice(b, 1);
			}
			if (sources[b] == sourceLocations[1]){
				sources.splice(b, 1);
			}
		};
		
		// Find the two sources closest to each other of the remaining 3.
		shortest = 1337;
		for (var c in sources){
			for (var cc in sources){
				path = creep.room.findPath(sources[c], sources[cc]);
				if (path.length < shortest){
					shortest = path.length;
					sourceLocation[2] = sources[c];
					sourceLocation[3] = sources[cc];
				}
			}
		}
		
		// Find the position halfway between those two just like before.
		path = creep.room.findPath(sourceLocation[2].pos, sourceLocation[3].pos, {ignoreCreeps: true});
		halfwayIndex = math.round(path.length/2);
		if {halfwayIndex > 1){
			spawnLocations[1] = creep.room.getPositionAt(path[halwayIndex].x, path[halfwayIndex].y);
		}
		
		// Now we want to make sure this is the most efficient spot for the second spawn.
		// If it's the case that the third most distant source from spawnLocations[0] is
		// closer to it than it is to spawnLocations[1], then we want to let the
		// spawnLocations[1] get as close to the other source as it can.
		
		// First figure out what the third most distant source from spawnLocation[0] is.
		// It sure as hell better be one of the 3 remainders in source or we fucked up earlier,
		// so it's the closest one of those three.  We will store this in sourceLocation[4].
		
		shortest = 1337;
		for (var d in sources){
			path = creep.room.findPath(sources[d].pos, spawnLocations[0], {ignoreCreeps:true});
			if (path.length < shortest){
				shortest = path.length;
				sourceLocation[4] = sources[d];
			}
		}
		
		// Now compare distance of sourceLocation[4] to spawnLocation[1].
		// If it's longer than shortest from earlier and sourceLocation[4] is either
		// sourceLocation[2] or [3], then we need to modify spawnLocation[1]
		// to be as close as it can be to the other source as it can get.
		path = creep.room.findPath(spawnLocation[1], sourceLocation[4], {ignoreCreeps: true})
		if (path.length > shortest){
			if (sourceLocation[2] == sourceLocation[4] || sourceLocation[3] == sourceLocation[4]){
				// Make sure we're moving to the right source, the one farther from spawnLocations[0].
				if (creep.room.findPath(spawnLocation[0], sourceLocation[2], {ignoreCreeps: true}).length < creep.room.findPath(spawnLocation[0], sourceLocation[3], {ignoreCreeps:true}).length){
					path = creep.room.findPath(spawnLocation[1], sourceLocation[2], {ignoreCreeps:true});
					var indexA = path.length - 1;
					spawnLocation[1] = creep.room.getPositionAt(path[indexA].x, path[indexA].y);
				}
			}
		}
		
		
	}
//-------------------------------------------------------------------------
//return populated object
return creepDo;
};


