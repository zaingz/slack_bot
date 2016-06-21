var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

var testSchema = Schema({
  //to: {type: ObjectId, ref: 'User'},
  //from: {type: ObjectId, ref: 'User'},
  //accepted: { type: Boolean, default: false } ,
  //rejected: { type: Boolean, default: false },
  completed: { type: Boolean, default: false } 
});

Test = mongoose.model('Test', testSchema);

module.exports = {
  Test: Test
}