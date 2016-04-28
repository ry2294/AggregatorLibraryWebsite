var express = require('express');
var app = express();
var router = express.Router();
var bodyParser = require('body-parser');
var AWS = require('aws-sdk');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

AWS.config.update({
    accessKeyId: '', 
    secretAccessKey: '',
    region: 'us-west-2'});
    
var dynamodbDoc = new AWS.DynamoDB.DocumentClient();

router.post('/tweet', function(req, res) {
    console.log("body = " + JSON.stringify(req.body));
    dynamodbDoc.put({
        TableName: req.body.table,
        Item: {
            "tweetid": req.body.tweetid,
            "text": req.body.text,
            "lat": req.body.lat,
            "lon": req.body.lon
        }
    }, function(error, data) {
        if(error) console.log("error = " + JSON.stringify(error));
        res.status(200).end();
    });
});

router.post('/time', function(req, res) {
    dynamodbDoc.put({
        TableName: req.body.table,
        Item: {
            "tweetid": req.body.tweetid,
            "text": req.body.text,
            "lat": req.body.lat,
            "lon": req.body.lon,
            "sentiment": req.body.sentiment,
            "time": req.body.time
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