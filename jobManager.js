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
			if (creep.memory.job == 'mharvest')
			{
				creepDo.mharvest(creep);
			}
			else if (creep.memory.job == 'sharvest')
			{
				creepDo.sharvest1(creep);
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
				Game.creeps[i].memory.job = "collect";
			}
			else
			{
				Game.creeps[i].memory.job = "nothing";
			}
		}
	};
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

