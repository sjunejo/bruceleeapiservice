var express = require('express');
var http = require('http');
var fs = require('fs');

// Constants
var PORT = 8081;
var apiKeyFileName = 'api_key.txt';

// App
var app = express();

var options = {
	host: 'www.stands4.com'
};

readAPIKey(apiKeyFileName);

function readAPIKey(apiKeyFileName) {
    fs.readFile(apiKeyFileName, 'utf8', function(err,data){
        if (err) {
            return console.log(err);
        };
        console.log(data);
        options.path = data;
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
             console.log(responseBody);
             // Call to database service here
             
		})
	});
	req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});
}

app.get('/', function(req, res){
    res.send('Hello world\n');
	queryAPI();
})

function storeInDatabase(responseBody) {
	// Make request to database service with response Body in POST
	// data
}
app.listen(PORT);
console.log('Running on http://localhost:' + PORT);