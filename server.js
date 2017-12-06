// objects
var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var url = require('url');
var mongoUrl = "mongodb://bugra:bugra@ds129906.mlab.com:29906/tiny_url";


// start express
var app = express();

app.use(express.static('public'));

app.get("/", function (request, response) {
  // Code here

});

app.get("/new/:protocol//:url", function (request, response) {

  var protocol = request.params["protocol"];
  var url_param = request.params["url"];
  var url_ext = url_param.split(".")[1];

  // if valid url
  if ((protocol === "http:" || protocol === "https:") && url_ext != undefined && url_ext != "") {
    var new_url = {};

    MongoClient.connect(mongoUrl, function (err, db) {
      if (err) throw err;

      var urls = db.collection("urls");

      // find last row in table
      db.collection("urls").find().limit(1).sort({ $natural: -1 }).toArray(function (err, res) {

        // set url object
        var index = res[0].index;
        index++;

        var original = protocol + "//" + url_param;
        var short_url = "https://codeinblack.com/" + index;
        new_url = { original_url: original, short_url: short_url };
        var new_url_db = { original_url: original, short_url: short_url, index: index };

        response.send(new_url);

        //insert row
        urls.insertOne(new_url_db, function(err, res){
          if(err) throw err;
          db.close();
        });

      });
    });
  } else {
    var error = {error: "Please enter a valid url."};
    response.send(error);
  }
});

app.get("/:index", function(request, response){
  
  var index = Number(request.params["index"]);
  var link = ""

  MongoClient.connect(mongoUrl, function(err, db){
    if (err) throw err;
    // find index and go to site
    db.collection("urls").find({index:index}).toArray(function(err, res){
      if(err) throw err;

      if(res[0] != undefined) {
        link = res[0].original_url;    
        response.writeHead(301,{Location:link});
        response.end();
        db.close();
      } else {
        response.sendStatus(404);
      }
    });
  });
});

app.get("*", function(req, res){
  res.send(404);
});

var listener = app.listen(3000, function () {
  console.log('Your app is listening on port 3000');
});
