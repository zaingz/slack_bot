var express    = require('express');        // call express
var app        = express();
var server = require('http').createServer(app);
var cookieParser = require('cookie-parser');
var session = require('express-session');
var uuid = require('uuid');

app.use(cookieParser());
app.use(session({
    genid: function(req) {
          return uuid.v1(); // use UUIDs for session IDs 
    },
    secret: 'slackbot12340987567'
}));

var exphbs  = require('express-handlebars');


var bodyParser = require('body-parser');
var constants = require("./constants");
//console.log(constants.SLACK_CRED.CLIENTID);

// Mongo Condig
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/slackbot');

// Cron Manager Initialization
// This Will initialize the cronmanager and 
// add the job for each team in the database
var manager = require("./cronmanager");


app.use('/public',express.static(__dirname + '/public'));
var TeamConfig = require("./models/team_config").TeamConfig;
helpers= {
  inc: function(i){
    return i+=1;
  },
  section: function(name, options) {
    console.log("Section Name", name);
    if(!this._sections) this._sections = {};
    this._sections[name] = options.fn(this);
    return null;
  },
  includes: function(elem, list, selected, options){
    try{
      if(selected || list.indexOf(elem) > -1 ) {
        return options.fn(this);
      }
    }catch(err){console.log(err);}
    return options.inverse(this);
  },
  compare: function(lvalue, rvalue, options){
    console.log("compare", lvalue, rvalue);
    try{
      var result = (lvalue.toString() == rvalue.toString());
      if( result ) {
          return options.fn(this);
      } 
    }catch(err){console.error(err);}
    return options.inverse(this);
  },
  getValue: function(index, answers){
    console.log(index, answers);
    try{
    return answers[index.toString()].ans;
    }catch(err){console.log(err);}
    return "";
  }
}

app.engine('handlebars', exphbs({defaultLayout: 'main', helpers: helpers}));
app.set('view engine', 'handlebars');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//
var port = process.env.PORT || 8080;        // set our port

var router = express.Router();             

// middleware To Log Request Time
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});

var test_route = require("./routes/test");
router.get("/test", test_route.index);

var bot_route = require("./routes/bot");
router.get("/oauth", bot_route.oauth);
router.get("/redirect/oauth", bot_route.oauth_redirect);

router.get("/", bot_route.index);
router.post("/save_users", bot_route.save_selected_users);
router.get("/select_channels", bot_route.select_channels);
router.post("/save_channels", bot_route.save_selected_channels);
router.get("/select_question_set", bot_route.select_question_set);
router.post("/save_question_set", bot_route.save_question_set);
router.get("/schedule_detail", bot_route.schedule_detail);
router.post("/save_schedule_detail", bot_route.save_schedule_detail);
router.get("/submit_answer", bot_route.submit_answer);
router.post("/save_answers", bot_route.save_answers);

app.use(router);

server.listen(port);
console.log('Magic happens on port ' + port);
