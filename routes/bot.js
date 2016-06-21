var SlackBot = require('slackbots');
var TeamConfig = require('../models/team_config').TeamConfig;
var QuestionSet = require('../models/question_set').QuestionSet;
var Post = require("../models/post").Post;
var UserAnswer = require("../models/user_answer").UserAnswer;
var mongoose = require('mongoose');
var constants = require("../constants");
var moment = require("moment");
var bothelper = require("../bothelper");
var request = require('sync-request');
var util = require('util');


module.exports.oauth = function(req, res){
  var slack = constants.SLACK_CRED;
  var url = util.format(slack.oauth_url+"?client_id=%s&scope=%s", slack.client_id, slack.scope);
  res.redirect(url);
}

module.exports.oauth_redirect = function(req, _res){
  var code = req.query.code;

  var slack = constants.SLACK_CRED;
  var url = "https://slack.com/api/oauth.access";
  var params = {
    client_id: slack.client_id,
    code: code,
    client_secret: slack.secret
  };

  var res = request('GET', url, {
    qs: params
  });
  console.log("Slack Res: ", res.body.toString('utf8'));
  response = JSON.parse(res.body.toString('utf8'));

  TeamConfig.findOne({bot_user_id: response.bot.bot_user_id}, function(err, tf){
    if(err) console.error(err);
    if(!tf)
      tf = TeamConfig();
    tf.bot_app_token = response.bot.bot_access_token;
    tf.bot_user_id = response.bot.bot_user_id;
    tf.res_dump = response;
    tf.save(function(err, tf){
      if(err) console.error(err);
      req.session.team_id = tf._id; 
      _res.redirect("/");
    });
    // Redirect the User Here To the Main APp
  });

}

module.exports.index = function(req, res){
  if(req.session.team_id){
    var team_id = req.session.team_id;
    console.log("Team Id", team_id);
    TeamConfig.findOne({_id: team_id}).populate('question_set').exec(function(err, tf){
      if(err) console.error(err);

      var bot = new SlackBot({
        token: tf.bot_app_token,
        name: tf.bot_name
      });

      bot.getUsers().then(function(data){
        res.render("bot/index", {users: data.members, team_conf: tf});
      }).fail(function(e){
        console.error(e);
      });
    });
  }else{
    res.render("bot/login");
  }

}

// Save Selected Users and Redirect to next step
module.exports.save_selected_users = function(req, res){
  var team_id = req.session.team_id || req.body.team_cf_id;
  TeamConfig.update({
    "_id": team_id
  },{
    "selected_users": req.body.users
  }, function(err, tf){
    if(err) console.error(err);
  });

  res.redirect("/select_channels");
}

// List to select Channels 
module.exports.select_channels = function(req, res){
  var team_id = req.session.team_id;
  TeamConfig.findOne({_id: team_id}, function(err, tf){
    if(err) console.error(err);

    var bot = new SlackBot({
      token: tf.bot_app_token,
      name: tf.bot_name
    });

    bot.getChannels().then(function(data){
      res.render("bot/select_channels", {channels: data.channels, team_conf: tf});
    }).fail(function(e){
      console.error(e);
    });

  });
}

// Save Selected Channels and Redirect to next step
module.exports.save_selected_channels = function(req, res){
  var team_id = req.session.team_id || req.body.team_cf_id;

  TeamConfig.update({
    "_id": team_id
  },{
    "selected_channels": req.body.channels
  }, function(err, tf){
    if(err) console.error(err);
  });

  res.redirect("/select_question_set");
}

// Select Question Set
module.exports.select_question_set = function(req, res){
  var team_id = req.session.team_id;
  TeamConfig.findOne({_id: team_id}).populate("question_set").exec( function(err, tf){
    if(err) console.error(err);
    QuestionSet.find({}, function(err, data){
      res.render("bot/select_question_set", {q_sets: data, team_conf: tf});
    })
  });
}
module.exports.save_question_set = function(req, res){
  var team_id = req.session.team_id || req.body.team_cf_id;

  TeamConfig.findOne({
    "_id": team_id
  }, function(err, tf){
    if(err) console.error(err);
    if(req.body.q_set == "custom"){
      var qs = QuestionSet({name: req.body.name, questions: req.body.questions, team_config: tf});
      qs.save(function(err, data){
        if(err) console.error(err);
        tf.question_set = qs;
        tf.save(function(err, tf){
          if(err) console.error(err);
          res.redirect("/schedule_detail") 
        });
      })
    }else{
      tf.question_set = req.body.q_set;
      tf.save(function(err, tf){
        if(err) console.error(err);
        res.redirect("/schedule_detail") 
      });
    }  
  });
}

module.exports.schedule_detail = function(req, res){
  var team_id = req.session.team_id;
  TeamConfig.findOne({_id: team_id}, function(err, tf){
    if(err) console.error(err);
    res.render("bot/schedule_detail", {team_conf: tf, timezones: constants.timezones, days: constants.days, m_hours: constants.max_hours , updatetime: constants.updatetime});
  });
}
module.exports.save_schedule_detail = function(req, res){
  var team_id = req.session.team_id || req.body.team_cf_id;
  
  TeamConfig.findOne({_id: team_id}).populate("question_set").exec( function(err, tf){
    if(err) console.error(err);
    console.log("Team Conf save schedule", tf);
    tf.time = req.body.time;  
    tf.timezone = req.body.timezone;
    tf.days = req.body.days;
    tf.max_hours = req.body.hours;
    tf.save(function(err, tf){
      if(err) console.error(err);
      bothelper.update_job(tf);
      res.render("bot/setup_complete", {});
    });
  });
}

module.exports.submit_answer = function(req, res){
  // Check if valid Time Has Not Passed
  // Save UserAnswer
  var post_id = req.query.id;
  Post.findOne({_id: post_id}).populate(
      {
        path: "team_config",
        model: "TeamConfig",
        populate: {
          path: "question_set",
          model: "QuestionSet"
      }
  }).exec(function(err, post){
    if(err) console.error(err);

    UserAnswer.findOne({post: post}, function(err, user_answer){
      if(err) console.error(err);
      var message_date = moment(post.createdAt.getTime()).utcOffset(0);
      if(moment().utcOffset(0) > message_date.add(post.team_config.max_hours, 'hours'))
        res.send("Not Valid"); 
      else
        res.render("bot/submit_answers", {post: post, user_answer: user_answer}); 
    });
    
  });

}

module.exports.save_answers = function(req, res){
  var post_id = req.body.post_id;
  Post.findOne({_id: post_id}).populate(
      {
        path: "team_config",
        model: "TeamConfig",
        populate: {
          path: "question_set",
          model: "QuestionSet"
      }
  }).exec(function(err, post){
    if(err) console.log(err);

    var message_date = moment(post.createdAt.getTime()).utcOffset(0);
    if(moment().utcOffset(0) > message_date.add(post.team_config.max_hours, 'hours'))
      res.send("Not Valid");
    
    console.log("Valid");

    var answers = {};
    post.team_config.question_set.questions.forEach(function(question, index){
      if(req.body[index.toString()]){
        answers[index.toString()] = {
          "ans": req.body[index.toString()],
          "dateTime": new Date()
        } 
      }
    });

    UserAnswer.findOne({post: post}, function(err, user_answer){
      if(err) console.error(err);
      if(!user_answer){
        user_answer = UserAnswer();
      }
      user_answer.team_config = post.team_config;
      user_answer.question_set = post.team_config.question_set;
      user_answer.answers = answers;
      user_answer.user= post.user;
      user_answer.post = post;
      user_answer.save(function(err, user_answer){
        if(err) console.error(err);
        user_answer.populate("question_set", function(err, user_answer){
          post.team_config.selected_channels.forEach(function(channel){
            bothelper.post_to_channel(post.team_config, channel, user_answer); 
          });
          res.send("Thanks for submitting the Answers");
        });
      });
    
    });

  });
}

