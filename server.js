var express = require('express');
var app = express();
var router = express.Router();
var path = require("path");
var bodyParser = require('body-parser');
var AWS = require('aws-sdk');
var _ = require('underscore');

app.use(bodyParser.json());

AWS.config.update({
    accessKeyId: 'AKIAJCAQWMNEIC7J7AWA', 
    secretAccessKey: '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',
    region: 'us-west-2'});
    
var dynamodbDoc = new AWS.DynamoDB.DocumentClient();
var dynamodb = new AWS.DynamoDB();

router.get('/', function(req, res) {
  res.sendfile(path.join(__dirname + '/home.html'));
});

router.post('/tweet', function(req, res) {
    dynamodbDoc.put({
        TableName: req.body.table,
        Item: {
            "tweetid": String(req.body.tweetid),
            "text": req.body.text,
            "lat": req.body.lat,
            "lon": req.body.lon
        }
    }, function(error, data) {
        if(error) console.log("error = " + JSON.stringify(error));
        res.status(200).end();
    });
});

app.use('/', router);

var http = require('http').Server(app);
var server = http.listen(process.env.PORT || 5000, function(){
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});

var io = require('socket.io').listen(server);
io.on('connection', function(socket){
  console.log('a user connected');
  dynamodb.scan({TableName: "javatweet"}, function(error, tweets) {
	if (error) console.log(JSON.stringify(error));
	else {
		console.log(JSON.stringify(tweets.Items[0]));
		_.each(tweets.Items, function(rawtweet) {
		    if(rawtweet.lat != null && rawtweet.lon != null && rawtweet.sentiment != null &&
		    rawtweet.text != null && rawtweet.time != null) {
		        var tweet = {};tweet.lat = rawtweet.lat.S;tweet.lon = rawtweet.lon.S;
    		    tweet.sentiment = rawtweet.sentiment.S;tweet.text = rawtweet.text.S;
    		    tweet.time = rawtweet.time.S;
    		    io.emit("javatweet", tweet);
		    }
		});
	}
  });
  
  dynamodb.scan({TableName: "cplusplustweet"}, function(error, tweets) {
	if (error) console.log(JSON.stringify(error));
	else {
		console.log(JSON.stringify(tweets.Items[0]));
		_.each(tweets.Items, function(rawtweet) {
		    if(rawtweet.lat != null && rawtweet.lon != null && rawtweet.sentiment != null &&
		    rawtweet.text != null && rawtweet.time != null) {
		        var tweet = {};tweet.lat = rawtweet.lat.S;tweet.lon = rawtweet.lon.S;
    		    tweet.sentiment = rawtweet.sentiment.S;tweet.text = rawtweet.text.S;
    		    tweet.time = rawtweet.time.S;
    		    io.emit("cplusplustweet", tweet);
		    }
		});
	}
  });
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

router.post('/time', function(req, res) {
    dynamodbDoc.put({
        TableName: req.body.table,
        Item: {
            "tweetid": String(req.body.tweetid),
            "text": req.body.text,
            "lat": req.body.lat,
            "lon": req.body.lon,
            "sentiment": req.body.sentiment,
            "time": req.body.time
        }
    }, function(error, data) {
        if(error) console.log("error = " + JSON.stringify(error));
        res.status(200).end();
        var tweet = {};
        tweet.lat = req.body.lat;tweet.lon = req.body.lon;tweet.time = req.body.time;
    	tweet.sentiment = req.body.sentiment;tweet.text = req.body.text;
        if(req.body.table == "javatweet") {
            io.emit('javatweet', tweet);
        } else {
            io.emit('cplusplustweet', tweet);
        }
    });
});

