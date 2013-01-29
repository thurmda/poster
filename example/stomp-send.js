/*
 * test comment
 */

var stomp = require('stomp');

var max = process.argv[2] || 100;
var counter = 0;

// Set to true if you want a receipt
// of all messages sent.
var receipt = true;

// Set debug to true for more verbose output.
// login and passcode are optional (required by rabbitMQ)
var stomp_args = {
    port: 61613,
    host: 'rmq-int-lb',
    debug: false,
    login: 'guest',
    passcode: 'guest',
}

var client = new stomp.Stomp(stomp_args);

var queue = '/queue/test_stomp';

client.connect();

client.on('connected', function() {
    var interval = setInterval(sendMessage, 250);
    function sendMessage(){
        counter++;
        if(counter <= max){
            client.send({
                'destination': queue,
                'body': 'Testing\n\nmessage # ' + counter,
                'persistent': 'true'
                }, receipt);
        }else{
            clearInterval(interval);
            console.log('Produced ' + counter + ' messages');
            client.disconnect();
        }
    }
});

client.on('receipt', function(receipt) {
    console.log("RECEIPT: " + receipt);
});

client.on('error', function(error_frame) {
    console.log(error_frame.body);
    client.disconnect();
});

process.on('SIGINT', function() {
    console.log('Produced ' + counter + ' messages');
    client.disconnect();
    process.exit(0);
});
