var net = require('net');
var url = require('url');
var util = require('util');
var querystring = require('querystring');
var http = require('http');

module.exports = adaptor;

function adaptor(req, res){
    console.dir(req.body);
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
    //var m = rx.location.exec(job.payload);
    if(job.payload.indexOf('Host:') > -1){
        var s = job.payload.substr(job.payload.indexOf('Host:') +6);
        var s1 = s.substr(0,s.indexOf('\n'));
        var host;
        var port;
        var location = s1.split(/:/);        
        host = location[0];
        port = location[1] || '80';

        var response = '';
        var socket = net.createConnection(port, host);
        socket
            .on('data', function(chunk) {
                response += chunk.toString();
            })
            .on('connect', function() {
                socket.write(job.payload);
                socket.end();
            })
            .on('end', function() {
                    job.response = response;
                    answer(job);
                    socket.destroy();
            });
    }else{
        console.error('Can\'t find URL in payload' ,job.payload  , m);
    }
}

function answer(job){
    var u = url.parse(job.callback);
    var options = {
          hostname: u.hostname,
          port: u.port || 80,
          path: u.path,
          method: 'POST',
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
          }
    }
    var data = {
         adaptor: JSON.stringify(job.adaptor),
         response: job.response
    }
    var postData = querystring.stringify(data);
    options.headers['Content-Length'] = postData.length;
    var req = http.request(options, function(res) {
            if(res.statusCode !== 200){
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
    console.log(postData);
    // write data to request body
    req.write(postData);
    req.end();
}
