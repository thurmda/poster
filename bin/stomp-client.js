var sys = require('util');
var stomp = require('stomp');

// Set debug to true for more verbose output.
// login and passcode are optional (required by rabbitMQ)
var options = {
    port: 61613,
    host: 'rmq-int-lb',
    debug: false,
    login: 'guest',
    passcode: 'guest',
};

var client = new stomp.Stomp(options);

var headers = {
    destination: '/queue/test_stomp',
    ack: 'client',
};

var messages = 0;

client.connect();

function message_callback(body, headers) {
    console.log('Message Callback Fired!');
    console.log('Headers: ' + sys.inspect(headers));
    console.log('Body: ' + body);
}

client.on('connected', function() {
    client.subscribe(headers, message_callback);
    console.log('Connected');
});

client.on('message', function(message) {
    //console.log("HEADERS: " + sys.inspect(message.headers));
    //console.log("BODY: " + message.body);
    console.log("Got message: " + message.headers['message-id']);
    client.ack(message.headers['message-id']);
    messages++;
});

client.on('error', function(error_frame) {
    console.log(error_frame.body);
    client.disconnect();
});

process.on('SIGINT', function() {
    console.log('\nConsumed ' + messages + ' messages');
    client.disconnect();
});
