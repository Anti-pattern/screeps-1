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
	
	creepDo.calculateSpawnConstruction = function (creep, minimum)
	{
	// When passed a creep and a minimum distance away from spawn, it finds the optimal
	// pattern for spawn placement, resulting in the lowest possible total distance
	// between all sources on the map and the spawn closest to them.  They are returned
	// in an array in the order they should be built.  (It's simply the most optimal, you could
	// do it suboptimally if you wanted for some reason)  Takes destructible structures
	// into account for pathfinding, including already placed spawns, so it's best run on an room with
	// finalized structures.  Can still function in a room with active spawns, but will not take
	// them into account.
	//
	// !WARNINGS!
	//
	// As of right now there are exactly 5 sources to a room and if that changes
	// this method will no longer work.  Similarly, may only place 3 spawns, and
	// assumes you will eventually place all 3.  Also, if there was a source within 
	// minimum distance from an exit, it would break.  Intend to fix later.
	//
	// ERROR CODES:
	// spawnLocations[3] = 0	: Operation was successful.
	// spawnLocations[3] = 1	: Creep needs to move somewhere else in order to place spawns.
	// spawnLocations[4] = pos	: Position creep needs to avoid in case of error type 1.
	//
	// Note: spawnLocations[4] will return false if spawnLocations[3] = 0.
	//
	
	
		var sources = creep.room.find(Game.SOURCES);
		var sourceLocations = [];
		var spawnLocations = [];
		var shortest = 31337;
		
		// Find the two sources that are closest to each other, save their 
		// objects as sourceLocations[0] and [1] for later use. shortest
		// is initialized to "1337" since it will always be higher than the length of
		// the path.
		
		for (var a in sources){
			for (var aa in _.without(sources, sources[a])){
				if (sources[a].room.findPath(sources[a].pos, sources[aa].pos, {ignoreCreeps: true}).length < shortest){
					shortest = sources[a].room.findPath(sources[a].pos, sources[aa].pos, {ignoreCreeps: true}).length;
					sourceLocations[0] = source[a];
					sourceLocations[1] = source[aa];
				}
			}
		}
		
		// Find the halfway point between the two closest sources.
		// If it is larger than the minimum passed to us, save it to spawnLocations[0] as a position object.
		var path = creep.room.findPath(sourceLocations[0].pos, sourceLocations[1].pos, {ignoreCreeps: true});
		var halfwayIndex = math.round(path.length/2);
		spawnLocations[0] = creep.room.getPositionAt(path[halwayIndex].x, path[halfwayIndex].y);

		// ***\/***NEEDS IMPROVEMENT***\/***


		// If the two sources are so close together that the minimum allowable distance makes it
		// impossible to get between them, while sub-optimal, we're going to find a path from the
		// relatively arbitrary position of the creep calling the method and apply the minimum distance
		// to that path.  If the creep is closer than the minimum distance to the proposed location,
		// we will return an error telling the creep to move somewhere else.  We'll even be nice enough
		// to give him the location the proposed site is at so he can avoid it properly.
		if (halfwayIndex < minimum){
			path = creep.pos.room.findPath(creep.pos, spawnLocations[0], {ignoreCreeps:true});
			if(path.length < minimum){
				console.log("!!!creepDo.calculateSpawnConstruction error: creep calling method needs to move!!!")
				spawnLocations[3] = 1;
				spawnLocations[4] = spawnLocations[0];
				return spawnLocations;
			}
			else {
				spawnLocations[0] = creep.room.getPositionAt(path[path.length - minimum].x, path[path.length - minimum].y);
			}
		}

		// ***/\***NEEDS IMPROVEMENT***/\***
		// It should have a better response to finding things too close together.
		// Moving to the side or a nearby square that still works would be the proper solution.
		// It's also a pain that it cares about the current position of the creep at any point
		// in the method.
		
		
		// Subtract the two sources we just found from the variable sources
		// since we don't need them anymore and we want to compare the remaining 3
		for (var b in sources){
			if (sources[b] == sourceLocations[0]){
				sources.splice(b, 1);
			}
			if (sources[b] == sourceLocations[1]){
				sources.splice(b, 1);
			}
		}
		
		// Find the two sources closest to each other of the remaining 3.
		shortest = 31337;
		for (var c in sources){
			for (var cc in _.without(sources, sources[c])){
				path = creep.room.findPath(sources[c], sources[cc], {ignoreCreeps:true});
				if (path.length < shortest){
					shortest = path.length;
					sourceLocations[2] = sources[c];
					sourceLocations[3] = sources[cc];
				}
			}
		}
		
		// Find the position halfway between those two and assign to the next spawn location.
		path = creep.room.findPath(sourceLocations[2].pos, sourceLocations[3].pos, {ignoreCreeps: true});
		halfwayIndex = math.round(path.length/2);
		spawnLocations[1] = creep.room.getPositionAt(path[halwayIndex].x, path[halfwayIndex].y);
		// Same error code handling as before.
		if (halfwayIndex < minimum){
			path = creep.pos.room.findPath(creep.pos, spawnLocations[1], {ignoreCreeps:true});
			if(path.length < minimum){
				console.log("!!!creepDo.calculateSpawnConstruction error: creep calling method needs to move!!!")
				spawnLocations[3] = 1;
				spawnLocations[4] = spawnLocations[1];
				return spawnLocations;
			}
			else {
				spawnLocations[1] = creep.room.getPositionAt(path[path.length - minimum].x, path[path.length - minimum].y);
			}
		}
		
		
		// Now we want to make sure this is the most efficient spot for the second spawn.
		// If it's the case that the third most distant source from spawnLocations[0] is
		// closer to it than it is to spawnLocations[1], then we want to let the
		// spawnLocations[1] get as close to the other source as it can.
		
		// First figure out what the third most distant source from spawnLocations[0] is.
		// It sure as hell better be one of the 3 remainders in source or we fucked up earlier,
		// so it's the closest one of those three.  We will store this in sourceLocations[4].
		
		shortest = 31337;
		for (var d in sources){
			path = creep.room.findPath(sources[d].pos, spawnLocations[0], {ignoreCreeps:true});
			if (path.length < shortest){
				shortest = path.length;
				sourceLocations[4] = sources[d];
			}
		}
		
		// Now compare distance of sourceLocations[4] to spawnLocations[1].
		// If it's longer than shortest from earlier and sourceLocations[4] is either
		// sourceLocations[2] or [3], then we need to modify spawnLocations[1]
		// to be as close to the other source as it can get.
		path = creep.room.findPath(spawnLocations[1], sourceLocations[4].pos, {ignoreCreeps: true})
		if (path.length > shortest){
			if (sourceLocations[2] == sourceLocations[4] || sourceLocations[3] == sourceLocations[4]){
				// Make sure we're moving to the right source, the one farther from spawnLocations[0].
				// I don't believe we need to error handle here as if path.length were less than the minimum,
				// it would have been caught in creating spawnLocations[1].
				if (creep.room.findPath(spawnLocations[0], sourceLocations[2].pos, {ignoreCreeps: true}).length > creep.room.findPath(spawnLocations[0], sourceLocations[3].pos, {ignoreCreeps:true}).length){
					path = creep.room.findPath(spawnLocations[1], sourceLocations[2].pos, {ignoreCreeps:true});
					var indexA = path.length - minimum;
					spawnLocations[1] = creep.room.getPositionAt(path[indexA].x, path[indexA].y);
				}
				else {
					path = creep.room.findPath(spawnLocations[1], sourceLocations[3].pos, {ignoreCreeps:true});
					var indexB = path.length - minimum;
					spawnLocations[1] = creep.room.getPositionAt(path[indexB].x, path[indexB].y);
				}
			}
		}
		
		// All that's left now is to assign the final spawnLocations to the remaining source.
		// That source is going to be the one that isn't sourceLocations [2] or [3].
		// ***\/***NEEDS IMPROVEMENT***\/***

		for (var e in sources){
			if (sources[e] != sourceLocations[2] && sources[e] != sourceLocations[3]){
				path = creep.room.findPath(creep.pos, sources[e].pos, {ignoreCreeps:true});
				if (path.length !< minimum) {
					var indexC = path.length - minimum;
					spawnLocations[2] = creep.room.getPositionAt(path[indexC].x, path[indexC].y, {ignoreCreeps:true});
				else {
					console.log("!!!creepDo.calculateSpawnConstruction error: creep calling method needs to move!!!")
					spawnLocations[3] = 1;
					spawnLocations[4] = creep.room.getPositionAt(path[path.length].x, path[path.length].y, {ignoreCreeps:true});
					return spawnLocations;
				}
			}	
		}
		// ***/\***NEEDS IMPROVEMENT***/\***
		// Should try to make a path from the closest other spawn location, not the creep, I think.
		// Could always resort to creep if that location fails as an error handler like the other ones.
		
		
		
		// Returns array describing where spawns should be in the order they should be spawned.
		// Note: it completely ignores whether there are friendly or hostile spawns already active.
		spawnLocations[3] = false;
		return spawnLocations;
	}
//-------------------------------------------------------------------------
//return populated object
return creepDo;
};


