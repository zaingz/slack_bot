var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/slackbot');

var ObjectId = mongoose.Types.ObjectId;

var TeamConfig  = require('./models/team_config').TeamConfig;
var QuestionSet = require('./models/question_set').QuestionSet;

var q_set_1 = QuestionSet({
  _id: ObjectId('123456789121'),
  name: "Question Set A",
  questions: [
    "What is your more important task today? ?",
    "When do you estimate you can finish it? 1  Today 2 ­ Tomorrow 3 ­ within 3 days 4 ­ 7 days 5 ­ 2 weeks 6 ­ 1 month 7 ­ Over 1 month"
  ] 
});
q_set_1.save(function(err){
  console.log(err);
});

var q_set_2 = QuestionSet({
  _id: ObjectId('123456789122'),
  name: "Question Set B",
  questions: [
    "What did you do yesterday?",
    "What will you do today?",
    "Is there anything in your way?"
  ] 
});
q_set_2.save(function(err){
  console.log(err);
});

var team1 = TeamConfig({
  _id: ObjectId('123456789124'),
  bot_app_token: "xoxb-38639130769-VcB1AqpmASmZQaWhQA6pfBPa",
  bot_name: "dailyupdates"
});
team1.save(function(err){
  console.log(err);
});
console.log("Complete");
