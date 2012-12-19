var net = require('net');
var url = require('url');
var util = require('util');
var querystring = require('querystring');

module.exports = adaptor;

function adaptor(req, res){
    if(validate(req)){
        res.statusCode = 200;
        res.write('Will call ' + req.body.callback + ' shortly with respone'); 
        res.end();
        process(req.body);
    }else{
        res.statusCode = 500;
        res.write('Not a valid request\n\n');
        res.write(util.inspect(req.body));
        res.end();
    }
}


function validate(req){
    //make sure there is postData etc.
    //console.log('Validating this request');
    //console.dir(req.body);
    if(typeof req.body  === 'undefined'){
        console.error('wtf?');
        console.dir(req.body);
        return false;
    }
    if(typeof req.body.payload === 'undefined'){
        console.error('No Payload');
        return false;
    }
    if(typeof req.body.callback === 'undefined' ||
            !url.parse(req.body.callback).hostname){
        console.error('No Callback');
        return false;
    }
    return true;
}

var rx = {
    location : /Host:\s*(\S+)/gi
};

function process(job){
    var m = rx.location.exec(job.payload);
    var location;
    var host;
    var port;
    if(m){
        location = m[1].split(/:/);        
        host = location[0];
        port = location[1] || '80';

        var response = '';
        var socket = net.createConnection(port, host);
        socket
            .on('data', function(chunk) {
                response += chunk.toString();
            })
            .on('connect', function() {
                socket.write(postData);
                socket.end();
            })
            .on('end', function() {
                    job.response = response;
                    answer(job);
            });
    }else{
        console.error('Can\'t find URL in payload' , m);
    }
}

function answer(job){
    var u = url.parse(job.callback);
    var options = {
          hostname: u.hostname,
          port: u.port,
          path: u.path,
          method: 'POST' 
    }
    var data = {
         response: job.response,
         adaptor: job.adaptor
    }
    var req = http.request(options, function(res) {
            if(res.statusCode !== '200'){
                console.error('STATUS: ' + res.statusCode);
                console.error('HEADERS: ' + JSON.stringify(res.headers));
            }
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log('BODY: ' + chunk);
                });
            });
    req.on('error', function(e) {
        console.error('problem with request: ' + e.message);
    });

    // write data to request body
    req.write(querystring.stringify(data));
    req.end();
}
