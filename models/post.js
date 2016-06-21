var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

var postSchema = Schema({
  user: String, //User ID
  team_config: {type: ObjectId, ref: 'TeamConfig'},
  text: {type: String, default: ""},
  response: Object,
  type: String, //channel or user
  channel: String, // Channel ID
  job_no: Number

}, {timestamps: true});

Post = mongoose.model('Post', postSchema);

module.exports = {
  Post: Post
}
