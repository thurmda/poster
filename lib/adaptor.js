var net = require('net');

module.exports = adaptor;

function adaptor(req, res){
    //This adaptor will respond immediately with a token which can be used later to track status. 
    //It then will asyncronously fire a request and track the response for the adaptor.
    var token = Math.random().toString().substr(2) + Math.random().toString().substr(2);
    res.end(token);
    console.log('Responded with token ' + token);
    //At this point the client has a response and can proceed on.

    if(validate(req)){
        process(token, req.body.postData);
    }else{
        console.error('Not a valid request for token ' + token);
    }
}


function validate(req){
    //make sure there is postData etc.
    //console.log('Validating this request');
    //console.dir(req.body);
    return true;
}

var rx = {
    location : /Host:\s*(\S+)/gi
};

function process(token, postData){
    var m = rx.location.exec(postData);
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
                console.log('Completed work for token ' + token );
                console.log('RESPONSE: \n' + response);
            });
    } 
}
