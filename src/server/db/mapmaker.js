var getPixels = require('get-pixels');
var db = require('./db.js');
var fs = require('fs');
var User = db.User,
    Event = db.Event,
    Map = db.Map,
    Image = db.Image;

// console.log(db.User + " should be a user constructor");

var chunkSize = 10;

/**
 * Given a user, image path, eventCode, eventName, and a callback, creates an event associated with the logged-in user, a main image for the event, and a map generated by analyzing the event's main image.
 * @param  {String}   facebookId - string used to look up the user.
 * @param  {String}   filePath   - path that points to the main mosaic image on cloudinary.
 * @param  {String}   eventCode  - string used to create an eventCode for the event.
 * @param  {String}   eventName  - name used to provide a value for the name of the event.
 * @param  {Function} done       - callback invoked on the object containing the event, image, and map.
 * @return {Object}              - object that looks like {map: Object, image: Object, event: Object}
 */
var saveEventAndMap = function(facebookId, filePath, eventCode, eventName, done){
  getPixels(filePath, function (err, pixels){
    if (err){
      done(err);
    }
    // console.log(pixels + "are our pixels");
    var _storage = chunker(pixels);
    mapEventMaker(facebookId, filePath, _storage, pixels, eventCode, eventName, done);
  });
};

/**
 * Saves a map; associates a map with a given event and an event with the saved map.
 * @param  {[Object]}
 * @param  {[ndArray]}
 * @param  {[Object]}
 * @param  {Function}
 * @return {[type]}
 */
var mapEventMaker = function(facebookId, filePath, _storage, pixels, eventCode, eventName, done){
  
  var createdEvent;

  /**
   * Randomly shuffles the keys in map.data to produce an array of keys (used for unfilledKeys and enabling us to add images to random locations of the master mosaic image)
   * @param  {Array} array - the array to shuffle.
   * @return {Array}       - the shuffled array.
   */
  var shuffleArray = function(array) {
    var currentIndex = array.length, temporaryValue, randomIndex ;

    while (0 !== currentIndex) {

      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  };
  /**
   * Produces an array of all the keys in map.data and invokes shuffleArray to shuffle them.
   * @return {Array} - the shuffled array.
   */
  var shuffleKeys = function(){
    var returnArr = [];
    for (key in _storage){
      returnArr.push({
        key: key,
        value: _storage[key]
      });
    }
    returnArr = shuffleArray(returnArr);
    return returnArr;
  };

  User.findOne({facebookId: facebookId}, function (err, user){
    if (err){
      done(err);
    }
    new Event({
      _creator: user._id,
      eventCode: eventCode,
      name: eventName,
    }).save(function (err, event){
      if (err){
        done(err);
      }
      user.events.push(event); //is this right?
      new Image({
        _parentUser: user._id,
        _parentEvent: event._id,
        imgPath: filePath
      }).save(function (err, image){
        if (err){
          done(err);
        }
        event.mainImage = image._id;
        new Map({
          _parentImage: image._id,
          data: _storage,
          unfilledKeys: shuffleKeys(),
          height: pixels.shape[1],
          width: pixels.shape[0]
        }).save(function (err, map){
          if (err){
            done(err);
          }
          image.map = map;
          user.save().then(function(){
            return event.save();
          }).then(function(){
            return image.save(); //TODO: make sure event is also saved.
          }).then(function(){
            return map.save();
          }).then(function(){
            createdEvent = {
              event: event,
              image: image,
              map: map
            };
            done(null, createdEvent);
          });
        });
      });
    });
  });
};

/**
 * Invokes chunkMaker and getAverageColor to construct a chunk as a given key of our _storage object. The _storage object is ultimately used as the value of the map object's data property.
 * @param  {ndarray} pixels - ndarray representing ALL of the pixels found in an image.
 * @return {Object}        - Object to be used for the value of map.data.
 */
var chunker = function(pixels){
  var _storage = {};
  var index = 0;
  var chunk;
  for (var i = 0; i < pixels.shape[1]; i+=chunkSize){
    for (var j = 0; j < pixels.shape[0];  j+=chunkSize){
      chunk = chunkMaker(j, i, pixels);
      _storage[index++] = {
        coords: [j, i], 
        originalRGB: getAverageColor(chunk)
      };
    }
  }
  // fs.writeFileSync('log.txt', util.inspect(_storage), 'utf-8');
  return _storage;
};

/**
 * calculates what pixels exist for a given chunk existing at a given set of coordinates (x, y)
 * @param  {Number} x - the x coordinate for the top-left corner of the chunk.
 * @param  {Number} y - the y coordinate for the top-left corner of the chunk.
 * @param  {Object} pixels - the ndarray that is iterated over.
 * @return {Array} - the flat array of pixels.
 */
var chunkMaker = function(x, y, pixels){
  var chunk = []; //construct a flat array of pixels scanning left to right, top to bottom.
  //pixels.get(x, y, z)
  for (var i = y; i < (y + chunkSize); i++){ //outer loop: height.
    for (var j = x; j < (x + chunkSize); j++){ //inner loop: width:
      for (var k = 0; k < 4; k++){ //inner-inner loop: depth (rgba values for each pixel)
        chunk.push(pixels.get(j, i, k));
      }
    }
  }
  return chunk;
};

/**
 * Calculates the average RGB value for pixels in a given chunk.
 * @param  {Array} chunk - the flat array.
 * @return {Object} - the returned RGB object.
 */
var getAverageColor = function(chunk) {
  var r = 0;
  var g = 0;
  var b = 0;

  for (var i = 0, l = chunk.length; i < l; i += 4) {
    r += chunk[i];
    g += chunk[i+1];
    b += chunk[i+2];
  };

  r = Math.floor(r / (chunk.length / 4));
  g = Math.floor(g / (chunk.length / 4));
  b = Math.floor(b / (chunk.length / 4));

  return { r: r, g: g, b: b };
};

exports.saveEventAndMap = saveEventAndMap;
exports.mapEventMaker = mapEventMaker; //for testing.