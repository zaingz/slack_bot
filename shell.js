var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/slackbot');
var TeamConfig = require('./models/team_config').TeamConfig;
var QuestionSet= require('./models/question_set').QuestionSet;
var UserAnswer = require('./models/user_answer').UserAnswer;
var bothelper = require("./bothelper");

TeamConfig.findOne({}).populate("question_set").exec(function(err, data){
  bothelper.cron_task_for_team(data);
});
