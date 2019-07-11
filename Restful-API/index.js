/**
 * Primary file for API
 * 
 */

// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');
var _data = require('./lib/data');

// Instantiate the Http server
var httpServer = http.createServer(function(req, res) {
    unifiedServer(req, res);
});

// Start the http server
httpServer.listen(config.httpPort, function() {
    console.log("The server is listening on port " + config.httpPort + " in " + config.envName + " mode");
});

// Instantiate the Https server
var httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
};
var httpsServer = https.createServer(httpsServerOptions, function(req, res) {
    unifiedServer(req, res);
});

// Start the https server
httpsServer.listen(config.httpsPort, function() {
    console.log("The server is listening on port " + config.httpsPort + " in " + config.envName + " mode");
});

//All the server logic for both the http and https server
var unifiedServer = function(req, res) {

    //Get the url and parse it
    var parsedUrl = url.parse(req.url, true);

    //Get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/|\/+$/g, '');

    // Get the Query string as an object
    var queryStringObject = parsedUrl.query;

    //Get the http method
    var method = req.method.toLowerCase();

    //get the headers as  a object
    var headers = req.headers;

    //Get the payload if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';

    req.on('data', function(data) {
        buffer += decoder.write(data);
    });
    req.on('end', function() {
        buffer += decoder.end();

        //Choose the handler this request should go to. If one not found choose the not found handler
        var choosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        //Construct the data object to send to the object
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer
        };

        //Route the request to the handler specified in router
        choosenHandler(data, function(statusCode, payload) {
            //use the statusCode called by handler or default to 200
            statusCode = typeof(statusCode) === 'number' ? statusCode : 200;

            //use the payload called back by handler or default to empty object
            payload = typeof(payload) === 'object' ? payload : {};

            //convert the payload to string
            var payloadString = JSON.stringify(payload);

            //return the repsonse
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);

            res.end(payloadString);

            //log the request path
            console.log('Returning this response: ', statusCode, payloadString);
        });

    });
};

//Define the handlers
var handlers = {};

//Define the ping handler
handlers.ping = function(data, callback) {
    callback(200);
};

//Define the Not found handler
handlers.notFound = function(data, callback) {
    callback(404);
};

//Define the request router
var router = {
    'ping': handlers.ping
};