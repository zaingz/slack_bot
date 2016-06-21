var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

var teamConfigSchema = Schema({
  bot_app_token: String,
  bot_user_id: String,
  bot_name: String,
  selected_users: [String],
  selected_channels: [String],
  question_set: {type: ObjectId, ref: 'QuestionSet'},
  days: [String],
  timezone: String,
  time: String,
  max_hours: Number,
  last_job_no: {type: Number, default: 0},
  res_dump: Object
  
}, {timestamps: true});

TeamConfig = mongoose.model('TeamConfig', teamConfigSchema);

module.exports = {
  TeamConfig: TeamConfig
}
