var jobManager = require('jobManager')();
var spawnManager = require('spawnManager')();

console.log("------ new tick ------");

jobManager.checkStatus();
//assign spawns
spawnManager.spawn();

//assign jobs
jobManager.assignJobs();

//action jobs
jobManager.actionJobs();
