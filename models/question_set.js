var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

var questionSetSchema = Schema({
  name: String,
  questions: [String],
  team_config: {type: ObjectId, ref: 'TeamConfig'},
  custom: {type: Boolean, default: true},
}, {timestamps: true});

QuestionSet = mongoose.model('QuestionSet', questionSetSchema);

module.exports = {
  QuestionSet: QuestionSet
}
