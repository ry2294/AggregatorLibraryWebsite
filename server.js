var express = require('express');
var app = express();
var router = express.Router();
var path = require("path");
var bodyParser = require('body-parser');
var AWS = require('aws-sdk');
var _ = require('underscore');

app.use(bodyParser.json());

AWS.config.update({
    accessKeyId: '', 
    secretAccessKey: '',
    region: 'us-west-2'});
    
var dynamodbDoc = new AWS.DynamoDB.DocumentClient();

router.get('/', function(req, res) {
  res.sendfile(path.join(__dirname + '/home.html'));
});

router.post('/comment', function(req, res) {
    console.log('/comment req = ' + JSON.stringify(req.body));
    dynamodbDoc.put({
        TableName: req.body.table,
        Item: {
            "id": String(req.body.id),
            "text": req.body.text
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
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

router.post('/time', function(req, res) {
    console.log('/time req = ' + JSON.stringify(req.body));
    dynamodbDoc.put({
        TableName: req.body.table,
        Item: {
            "id": String(req.body.id),
            "text": req.body.text,
            "sentiment": req.body.sentiment,
            "time": req.body.time
        }
    }, function(error, data) {
        if(error) console.log("error = " + JSON.stringify(error));
        res.status(200).end();
        var comment = {}; comment.time = req.body.time;
    	comment.sentiment = req.body.sentiment;comment.text = req.body.text;
        io.emit(req.body.table, comment);
    });
});