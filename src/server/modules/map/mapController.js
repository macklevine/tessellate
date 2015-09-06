var sendResp = require('../../config/helpers').sendResponse,
    db       = require('../../db/db.js');

var Event    = db.Event,
  User     = db.User,
  Map    = db.Map;

module.exports = {
  getMap: function(eventCode){
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
            
          }
        })
      }
    });
  },

  saveMap: function(event, data){
    
  }
};