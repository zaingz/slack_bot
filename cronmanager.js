var CronJobManager = require('cron-job-manager');
var manager = new CronJobManager(); 

var TeamConfig = require('./models/team_config').TeamConfig;
var QuestionSet= require('./models/question_set').QuestionSet;
var bothelper = require('./bothelper');

var util = require('util');

console.log("Cron Manager");

TeamConfig.find({}).populate('question_set').exec(function(err, data){
  data.forEach(function(tf, index){
    try{
      var cronTime = bothelper.get_cron_time(tf);
      console.log(cronTime);
      manager.add(
        "job_"+tf._id,
        cronTime,
        function() { bothelper.cron_task_for_team(tf); },
        {start: true }  
      );
      console.log(util.format("Job Added team Id %s",tf._id));
    }catch(error){
      console.error(error);
    }
  });
});

function get_manager(){
  return manager;
}

module.exports.get_manager = get_manager;
