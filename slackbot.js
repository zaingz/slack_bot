'use strict';

var constants = require('./constants');
var SlackBot = require('slackbots');

var bot = new SlackBot({
  token: constants.SLACK_CRED.BOTAPITOKEN,
  name: constants.SLACK_CRED.BOTNAME
});

module.exports.bot = bot;
