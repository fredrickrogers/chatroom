var http = require('http'); //Built-int module provides http server/client functionalisty
var fs = require('fs'); // Built-in module provide filesystem functionality
var path = require('path'); // Built-in module. filesystem path-related functionality
var mime = require('mime'); // orivides ability to derive MIME type based on filename extension
var cache = {};

function send404(response) {
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.write('Error 404: resource not found');
    response.end();
}

function sendFile(response, filePath, fileContents) {
    response.writeHead(
        200, 
        {"content-type": mime.lookup(path.basename(filePath))}
    );
    response.end(fileContents);
}

function serveStatic(response, cache, absPath) {
    if(cache[absPath]) {
        sendFile(response, absPath, cache[absPath]);
    }
    else {
        fs.exists(absPath, function(exists) {
             if(exists) {
                 fs.readFile(absPath, function(err, data) {
                    if(err) {
                        send404(response);
                    }
                    else {
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                 });
             } else {
                 send404(response);
             }
        });
    }
}

var server = http.createServer(function(request, response) {
   var filePath = false;
   
   if(request.url == '/') {
       filePath = 'public/index.html';
   }
   else {
       filePath = 'public' + request.url;
   }
   var absPath = './' + filePath;
   serveStatic(response, cache, absPath);
});

server.listen(process.env.PORT, function() {
    console.log("Server listening on "+ process.env.IP + ":"  + process.env.PORT);
});

var chatServer = require('./lib/chat_server');
chatServer.listen(server);