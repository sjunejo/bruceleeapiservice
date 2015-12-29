var express = require('express');
var http = require('http');
var fs = require('fs');
var parseXMLString = require('xml2js').parseString;
var util = require('util');
var amqp = require('amqplib/callback_api');

// Constants
var PORT = 8081;
var apiKeyFileName = 'api_key.txt';

// App
var app = express();

var options = {
	host: 'www.stands4.com'
};

function readAPIKeyAndQueryAPI(apiKeyFileName, queryAPI) {
    fs.readFile(apiKeyFileName, 'utf8', function(err,data){
        if (err) {
            return console.log(err);
        };
        console.log(data);
        options.path = data;
		queryAPI();
    });
}

var responseBody = '';

function queryAPI(){
    console.log(options.path);
	var req = http.get(options, function(res) {
		console.log('STATUS: ' + res.statusCode);
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
            responseBody+=chunk;
		});
		res.on('end', function() {
             // console.log(responseBody);
			 parseXMLString(responseBody, function(err, result){
				var jsonResult = JSON.stringify(result);
				//console.log(jsonResult);
				// Call to database service here, to store quote data.
				// so produce message
			 sendToExchange(jsonResult);
			 });  
		})
	});
	req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});
}

function sendToExchange(json) {
	amqp.connect('amqp://localhost', function(err, conn) {
	  conn.createChannel(function(err, ch) {
		var exchange = 'quotes';
		ch.assertExchange(exchange, 'fanout', {durable: false});
		ch.publish(exchange, '', new Buffer(json));
		console.log(" [x] Sent JSON");
	  });
	  // setTimeout(function() { conn.close(); process.exit(0) }, 500);
	});
}

app.get('/', function(req, res){
    // res.send('Hello world\n');
	readAPIKeyAndQueryAPI(apiKeyFileName, queryAPI);
})

function storeInDatabase(responseBody) {
	// Make request to database service with response Body in POST
	// data
}

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);