var _ = require('lodash');
var creepDo = require('creepDo') ();
var means = require('means');
module.exports = function()

	{
//declare base object
var jobManager = function() {};
//-------------------------------------------------------------------------
	jobManager.actionJobs = function ()
	{
		for(var i in Game.creeps)
		{
			var creep = Game.creeps[i];
			if (creep.memory.job == 'sharvest')
			{
				creepDo.sharvest1(creep);
			}
			
			
			else if (creep.memory.job == 'collector1')
			{
				if (!creep.spawning){
					if (creep.memory.currentlyAssigned===0){
						var guys = creep.room.find(Game.MY_CREEPS);
						var harvesters = [];
						for (var ii in guys){
							if (guys[ii].memory.job=='sharvest' && guys[ii].memory.collectors < 2){
								harvesters.push(guys[ii]);
							}
						}
						if (harvesters.length){
							creep.memory.currentlyAssigned = 1;
							creep.memory.assignment = creepDo.findClosestArray(creep, harvesters).name;
						}
					}
					else {
						if (creep.pos.inRangeTo(creepDo.rememberCreep(creep.memory.assignment), 3) && creep.energy < creep.energyCapacity){
						creepDo.collectEnergy(creep);
						}
						else if (creep.energy == creep.energyCapacity){
							creepDo.bringEnergyHome(creep);
						}
						else (creep.moveTo(creepDo.rememberCreep(creep.memory.assignment)));
					}
				}
			}
			
			
			else if (creep.memory.job == 'guard')
			{
				creepDo.rangedSeek1(creep);
			}
			else if (creep.memory.job == 'collect')
			{
				creepDo.collector1(creep);
			}
			
		}
	};
	jobManager.assignJobs = function ()
	{
		for(var i in Game.creeps)
		{
			if (jobManager.creepHasMeans(Game.creeps[i], "mharvest"))
			{
				Game.creeps[i].memory.job = "mharvest";
			}
			if (jobManager.creepHasMeans(Game.creeps[i], "sharvest"))
			{
				Game.creeps[i].memory.job = "sharvest";
			}
			else if (jobManager.creepHasMeans(Game.creeps[i], "attackHostile"))
			{
				Game.creeps[i].memory.job = "guard";
			}
			else if (jobManager.creepHasMeans(Game.creeps[i], "collect"))
			{
				Game.creeps[i].memory.job = "collector1";
			}
			else
			{
				Game.creeps[i].memory.job = "nothing";
			}
		}
	};
	
	
	
	jobManager.checkStatus = function ()
	{

// Assign collectors to their harvesters in memory
		for (var xx in Game.creeps){
			var assCollect = 0;
			for (var xxx in Game.creeps){
				if (Game.creeps[xxx].memory.assignment == Game.creeps[xx].name){
					if(Game.creeps[xxx].memory.job == "collector1" && Game.creeps[xx].memory.job == "sharvest"){
						assCollect ++;
					}
				}
			}
			Game.creeps[xx].memory.collectors = assCollect;
		}

// Check status of and assign a source to spawns if they don't have one.
		for (var y in Game.spawns){
			var roomSources = Game.spawns[y].room.find(Game.SOURCES);
			var availSources = Game.spawns[y].room.find(Game.SOURCES);

			if (!Game.spawns[y].memory.currentlyAssigned){
				for (var yx in Game.spawns){
					if (availSources.length){
						for (var yy in Game.spawns[yx].room.find(Game.SOURCES)){
							if (Game.spawns[yx].room.find(Game.SOURCES)[yy].id == Game.spawns[yx].memory.assignedSource){
								availSources.splice(availSources.indexOf(Game.spawns[yx].room.find(Game.SOURCES)[yy]), 1);
							}
						}
					}
				}
				if (availSources.length){
							Game.spawns[y].memory.assignedSource = creepDo.findClosestArray(Game.spawns[y], availSources).id;
							Game.spawns[y].memory.currentlyAssigned = 1;
							console.log("!!!" + Game.spawns[y] + " Source assigned!!!");
				}
				else {
							console.log("It's true! " + Game.spawns[y].name + "is sourceless!  Sourceless, like an ANIMAL!");
				}
			}
		}
		
		
// ---------------------------------------------------------------
	}
	
	jobManager.creepHasMeans = function (creep, mean)
	{
		var creepParts = [];
		for (var x in creep.body)
		{
			creepParts[x] = creep.body[x].type;
		}
//console.log('mean: ' + means[mean]);
//console.log('creep: ' + creepParts);
		var result = _.difference(means[mean], creepParts);
//console.log('result: ' + result);
		if (result.length)
			return false;
		else
			return true;
	};
	jobManager.countUnitWithMeans = function (mean)
	{
		var result = 0;
		for(var i in Game.creeps)
		{
			if (jobManager.creepHasMeans(Game.creeps[i], mean))
			result++;
		}
		return result;
	};
//-------------------------------------------------------------------------
//return populated object
	return jobManager;
};

