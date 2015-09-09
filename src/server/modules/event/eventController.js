var sendResp = require('../../config/helpers').sendResponse,
    db       = require('../../db/db'),
    mapmaker = require('../../db/mapmaker'),
    cloudinary = require('../cloudinary/cloudinary.controller.js');

module.exports = {

  findEvent: function (req, res){
    var eventCode = req.body.eventCode;
    db.Event.findOne({eventCode: eventCode}, function(err, event){
      if (err){
        console.log(err);
      }
      if (event){
        sendResp(res, {event: event}, 200);
      } else {
        sendResp(res, {event: false}, 404);
      }
    });
  },

  createEvent: function (req, res){

    // for debugging
    // console.log(req.file);
    // console.log(req.file.path);

    var eventCode = req.body.eventCode,
        eventName = req.body.eventName,
        facebookId = req.body.facebookId;

    // console.log(eventCode + " is our event code...");
    // console.log(eventName + " is our event name...");
    // console.log(facebookId + " is our facebookId...");

    db.Event.findOne({eventCode: eventCode}, function(err, event){
      if (err){
        console.log(err);
      }
      if (event){
        sendResp(res, {event: "sorry, that event code already exists"});
      } else {
        cloudinary.postImages(req, res, function(result){
          console.log(result.url + " is the result we got back!");
          mapmaker.saveEventAndMap(facebookId, result.url, eventCode, eventName, function(returnObj){
            res.json(returnObj);
            sendResp(res);
          });
        });
      }
    });
  }
};