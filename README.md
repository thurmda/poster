
This is a modification for the first commit.


#Adaptor


To start your server find an open port and set that as an enviormnet variable
when executing the server. i.e.

    PORT=12345 node bin/server.js


You can then POST to the serer and it will validate your request and
immediately respond confirming the validation. The server will then process
POST to the thrid party API asynchronously. It will then POST the respone to
the callback URL you provided allong with the adaptor variable that was sent.


i.e.

 curl \
 -d '{"payload" : "a whole lot of \n\n text\nwith line breaks and <xml> and spaces </xml>", "callback" : "URL", "adaptor": {"id": 123,
 "name":"mailchimp"}}' \
 -H "Content-Type: application/json" \
 http://localhost:4444


