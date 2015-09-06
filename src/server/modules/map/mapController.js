var sendResp = require('../../config/helpers').sendResponse,
    db       = require('../../db/db.js');

var Event    = db.Event,
  User     = db.User,
  Map    = db.Map;

module.exports = {
  getMap: function(req, res){
    var eventCode = req.body.eventCode;
    Event.findOne({eventCode: eventCode}, function(err, event){
      //TODO: handle error
      if (!event){
        console.log("error: event not found");
      } else if (event){
        Map.findOne({_parentEvent: event._id}, function(err, map){
          //TODO: handle error
          if (!map){
            console.log("error: map not found");
          } else if (map){
            res.send(map);
          }
        })
      }
    });
  },

  saveMap: function(event, data){
    
  }
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