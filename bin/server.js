var connect = require('connect');
var adaptor = require('../lib/adaptor');

var PORT = process.env.PORT || 4444;
var app = connect()
    .use(connect.logger('dev'))
    .use(connect.json())
    .use(connect.urlencoded())
    .use(connect.multipart())
    .use(adaptor)
    .listen(PORT);

console.log('Server started on port ' + PORT);
