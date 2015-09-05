var sendResp = require('../../config/helpers').sendResponse,
    dB       = require('../../db/db'),
    mapmaker = require('../../db/mapmaker'),
    cloudinary = require('../cloudinary/cloudinary.controller.js');

module.exports = {

  findEvent: function (req, res){
    var eventCode = req.body.eventCode;
    dB.Event.findOne({eventCode: eventCode}, function(err, event){
      if (err){
        console.log(err);
      }
      if (event){
        sendResp(res, {event: event});
      } else {
        sendResp(res, {event: false});
      }
    });
  },

  createEvent: function (req, res){
    var eventCode = req.body.eventCode;
    console.log(req.files + "is our file");
    // dB.Event.findOne({eventCode: eventCode}, function(err, event){
    //   if (err){
    //     console.log(err);
    //   }
    //   if (event){
    //     sendResp(res, {event: false});
    //   } else {
    //     console.log("route works");
        // cloudinary.postImages(req, res, function(result){
        //   for (var key in result){
        //     console.log(key + ":" + result[key]);
        //   }
        //   console.log(result + "is the resulting object cloudinary sends back");
        //   // mapmaker.saveEventAndMap(username, result.path, eventCode, function(){
        //   //  res.end();
        //   // })
        // });
      // }
    // })

  }
};