var sendResp = require('../../config/helpers').sendResponse,
    db       = require('../../db/db.js');

var Event    = db.Event,
  User     = db.User,
  Map    = db.Map;

//both functions should have the event send along on req.body.
//should the event be held in local storage? Or a $scope variable? discuss this on Monday.
module.exports = {
  //for users trying to view an event.
  getMap: function(req, res){
    //TODO: handle error
    Map.findOne({_parentEvent: req.body.event._id}, function(err, map){
      //TODO: handle error
      if (!map){
        console.log("error: map not found");
      } else if (map){
        res.send(map);
      }
    });
  },

  saveMap: function(req, res){
    var conditions = {_parentEvent: req.body.event._id},
        update     = {data: req.body.event.map.data},
        options    = {new: true}, //guarantees that the callback returns the saved map object.

    Map.findOneAndUpdate(conditions, update, options, function(err, foundMap){
      res.send(foundMap);
    });
      //TODO: add callback, etc.
  }

  //   var conditions = { name: 'borne' }
  //   , update = { $inc: { visits: 1 }}
  //   , options = { multi: true };

  // Model.update(conditions, update, options, callback);
};

//Example angular code below:

    // AuthService.login($scope.user)
    //   .then(function (token) {
    //     if (token === "password incorrect"){
    //       $scope.passwordIncorrect = true;
    //       $scope.usernameNotFound = false;
    //     } else if (token === "username not found"){
    //       $scope.usernameNotFound = true;
    //       $scope.passwordIncorrect = false;
    //     } else {
    //       $window.localStorage.setItem('com.beer-tab', token);
    //       $location.path('/main');
    //     }
    //   })