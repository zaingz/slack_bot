var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;
var findOrCreate = require('mongoose-findorcreate');

var userAnswerSchema = Schema({
  user: String,
  team_config: {type: ObjectId, ref: 'TeamConfig'},
  question_set: {type: ObjectId, ref: 'QuestionSet'},
  post: {type: ObjectId, ref: 'Post'},
  // { '0': {'ans': "True", 'dateTime': Date}  }
  // 0 here is the index of the array of questions in QuestionSet
  answers: Object

}, {timestamps: true});
userAnswerSchema.plugin(findOrCreate);

UserAnswer = mongoose.model('UserAnswer', userAnswerSchema);

module.exports = {
  UserAnswer: UserAnswer
}
