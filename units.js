module.exports =
{
	"harvester": {
		"parts": [Game.CARRY, Game.WORK, Game.MOVE],
		"memory": {
			"name": "harvester"
		}
	},
	"builder": {
		"parts": [Game.WORK, Game.MOVE],
		"memory": {
			"name": "builder"
		}
	},
	"guard": {
		"parts": [Game.TOUGH, Game.MOVE, Game.MOVE, Game.RANGED_ATTACK, Game.RANGED_ATTACK],
		"memory": {
			"name": "guard"
		}
	}
	
	"hulk": {
		"parts": [Game.WORK, Game.WORK, Game.WORK, Game.WORK, Game.MOVE],
		"memory": {
			"name": "hulk"
		}
	},
	"iteron": {
		"parts": [Game.CARRY, Game.CARRY, Game.CARRY, Game.MOVE, Game.MOVE],
		"memory": {
			"name": "iteron"
		}
	},
}
