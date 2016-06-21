var Test = require('../models/test').Test;

module.exports.index = function(req, res){
  Test.find({}, function(err, tests) {
    
    if (!err){ 
      console.log(tests);
    } else {
      throw err;
    }

    res.render("test", {tests: tests});
  });
}
