// Convert a string like 10:05 PM to 24h format, returns like [22,5]
var util = require('util');
var SlackBot = require('slackbots');
var urljoin = require('url-join');
var constants = require("./constants");
var moment = require('moment');
var Post = require("./models/post").Post;
var TeamConfig = require("./models/team_config").TeamConfig;
var manager = require("./cronmanager");


function convert_to_24h(time_str) {
  console.log("time_str", time_str);
  var time = time_str.match(/(\d+):(\d+) (\w)/);
  var hours = Number(time[1]);
  var minutes = Number(time[2]);
  var meridian = time[3].toLowerCase();

  if (meridian.toLowerCase() == 'p' && hours < 12) {
    hours = hours + 12;
  }
  else if (meridian.toLowerCase() == 'a' && hours == 12) {
    hours = hours - 12;
  }
  return [hours, minutes];
}

// Get the crontime specific to passed team configuration
function  get_cron_time(teamConf)
{
  var time = convert_to_24h(teamConf.time);
  console.log("24 Hour Time", time);
  var time_in_hours = time[0] + time[1]/60;
  console.log("Total Time in hours", time_in_hours);
  
  var m = moment(teamConf.time, "h:mm a").utcOffset(0).add(-Number(teamConf.timezone), "hours");
  var minutes = m.minutes();
  var hours = m.hours();
  //var server_timezone_offset_hrs = -(new Date().getTimezoneOffset())/60;
  //console.log("Server Timezone Offset Hrs", server_timezone_offset_hrs);
  //var time_in_hours = time_in_hours - (Number(teamConf.timezone) - server_timezone_offset_hrs);
  //console.log("Time In Hours", time_in_hours);
  //var hours = time_in_hours | 0;
  //console.log("Hours", hours);
  //var minutes = ((time_in_hours - hours)*60) | 0;
  //console.log("minutes", minutes);

  var cronTime = util.format("00 %d %d * * %s", minutes, hours, teamConf.days.toString());
  return cronTime;
}

// Get All Selected Users
// Post a (link to form ) To Each Selected User on Slack
function cron_task_for_team(teamConf)
{
  console.log(util.format("Job For team id: %s", teamConf._id));
  console.log("before: ", teamConf.last_job_no);
  // First Update Last Job No
  teamConf.last_job_no = teamConf.last_job_no + 1;
  teamConf.save(function(err, teamConf){
    if(err) console.error(err);

    console.log("after: ", teamConf.last_job_no);
    var bot = new SlackBot({
      token: teamConf.bot_app_token,
      name: teamConf.bot_name
    });
    var bullet = "•";
    teamConf.selected_users.forEach(function(user_id, index){

      Post({
        user: user_id,
        team_config: teamConf,
        job_no: teamConf.last_job_no
      }).save(function(err, post){
        var date = moment().utcOffset(teamConf.timezone*60).format('DD MMMM YYYY');
        var text = util.format("Daily Updates for %s\n\n", date);
        text += "\n"+teamConf.question_set.questions.join("\n");
        var link = urljoin(constants.BASE_URL, "submit_answer", util.format("?id=%s",post._id));
        text += util.format("\n<%s|Click Here to Answer>", link);
        bot.postMessage(user_id, text, {as_user: true}).then(function(data){
          console.log(data);
          post.text = text;
          post.response = data;
          // Save Again
          post.save(function(err, post){
            if(err) console.error(err);
          });
        }).fail(function(data){
          console.log(data);
        });      
      });

    });
  });
   
}

function updateJob(teamConf)
{
  var job_key = "job_"+teamConf._id;
  var cronTime = get_cron_time(teamConf);
  console.log("Cron Time: ", cronTime);
  var cmanager = manager.get_manager();
  console.log("I got the current jobs: " + cmanager);
  
  if (cmanager.exists(job_key)){ 
    console.log("key exists");
    cmanager.update(job_key, cronTime, function(){cron_task_for_team(teamConf);} );
  }
  else{
    console.log("key doest not exists");
    cmanager.add(job_key, cronTime, function() { cron_task_for_team(teamConf); }, {start: true});
  }
  console.log("Cron Time", cronTime); 
  console.log("Now I got the current jobs: " + cmanager);
}

function updatePost(teamConf, ts, updated_text, channel_id)
{
  var bot = new SlackBot({
    token: teamConf.bot_app_token,
    name: teamConf.bot_name
  });
  bot._api("chat.update", {
    channel: channel_id,
    ts: ts,
    text: updated_text 
  }).then(function(data){
    console.log(data);
  }).fail(function(data){
    console.log(data);
  });
}

function get_channel_members(teamConf, channel, callback)
{
  var bot = new SlackBot({
    token: teamConf.bot_app_token,
    name: teamConf.bot_name
  });
  bot._api("channels.info", {
    channel: channel,
  }).then(function(data){
    console.log("get members", data);
    callback(data.channel.members);
  }).fail(function(data){
    console.log("get members fail", data);
    callback([]);
  });
}

function make_post_text(teamConf, channel, callback)
{
  UserAnswer.find().populate({
    path: "post",
    match: {type: "cahnnel", job_no: teamConf.last_job_no}
  }).populate("question_set").exec(function(err, data){
    if(err) console.log(err);
    if(data)
    {
      var text = "";
      var bullet = "•";
      data.forEach(function(user_answer, index){
        get_channel_members(teamConf, channel, function(members){ 
          if(members.indexOf(user_answer.user)>=0){
            console.log("Is A Member");
            text += "\n\n" + user_answer.user + "\n\n";
            Object.keys(user_answer.answers).forEach(function(key){
              text += "\n" + user_answer.question_set.questions[Number(key)];
              text += "\n" + bullet + user_answer.answers[key]["ans"];
            });
          }
          console.log("length", data.length);
          console.log("index", index);
          console.log("text", text);
          if(index >= data.length-1)
          {
            callback(text);
          }
        });
        
      });
    }
  });
}

function post_to_channel(teamConf, channel, user_answer)
{
  // First Check if the user is the member of the Channel
  // Find Channel Post for today 
  // If not preset create One
  // Send in case of new Post
  // Update in case of already present

  get_channel_members(teamConf, channel, function(members){ 
    if(members.indexOf(user_answer.user)>=0){
      var bullet = "•";
      Post.findOne({
        job_no: teamConf.last_job_no,
        type: "channel",
        channel: channel,
        team_config: teamConf
      }, function(err, post){
        if(err) console.log(err); 

        if(post)
        {
          // Update Channel Post
          make_post_text(teamConf, channel, function(_p_text){
            console.log("CheckText", _p_text);
            if(_p_text && _p_text.length>0){
              post.text = _p_text;
              post.save(function(err, post){
                if(err) console.error(err); 
                updatePost(teamConf,post.response.ts, post.text, channel);
              });
            }
          }); 
          
        }
        else
        {
          // Create New Post
          var text = "\n\n" + user_answer.user + "\n\n";
          Object.keys(user_answer.answers).forEach(function(key){
            text += "\n" + user_answer.question_set.questions[Number(key)];
            text += "\n" + bullet + user_answer.answers[key]["ans"];
          });

          Post({
            text: text,
            channel: channel,
            type: "channel",
            job_no: teamConf.last_job_no,
            team_config: teamConf 
          }).save(function(err, post){
            if(err) console.error(err);
            // Call Bot To Post to Channel
            var bot = new SlackBot({
              token: teamConf.bot_app_token,
                name: teamConf.bot_name
            });

            bot.postMessage(post.channel, post.text).then(function(data){
              console.log(data);
              post.response = data;
              post.save(function(err, post){
                if(err) console.error(err);
                console.log(post);
              });
    
            }).fail(function(data){
              console.log(data);
            })
          });
        }
      });
    }
  });

  
}

module.exports.convert_to_24h = convert_to_24h;
module.exports.get_cron_time = get_cron_time;
module.exports.cron_task_for_team = cron_task_for_team;
module.exports.post_to_channel = post_to_channel;
module.exports.update_job = updateJob;
