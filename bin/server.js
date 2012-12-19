var connect = require('connect');
var adaptor = require('../lib/adaptor');

var app = connect()
    .use(connect.logger('dev'))
    .use(connect.json())
    .use(connect.urlencoded())
    .use(connect.multipart())
    .use(adaptor)
    .listen(4444);

