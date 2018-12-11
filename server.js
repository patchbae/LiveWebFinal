// HTTP Portion
var http = require('http');
var fs = require('fs'); // Using the filesystem module
var httpServer = http.createServer(requestHandler);
var url = require('url');
var current_question = 0;
let users = [];
var num_users = 0;
var prompt;

httpServer.listen(8080);

function shuffle(array) {
    var i = array.length,
        j = 0,
        temp;

    while (i--) {

        j = Math.floor(Math.random() * (i+1));

        // swap randomly chosen element with current element
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;

    }

    return array;
}

var scene1_order = shuffle([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]);
var scene2_order = shuffle([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]);
var scene3_order = shuffle([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]);

function requestHandler(req, res) {

	var parsedUrl = url.parse(req.url);
	// console.log("The Request is: " + parsedUrl.pathname);

	fs.readFile(__dirname + parsedUrl.pathname,
		// Callback function for reading
		function (err, data) {
			// if there is an error
			if (err) {
				res.writeHead(500);
				return res.end('Error loading ' + parsedUrl.pathname);
			}
			// Otherwise, send the data, the contents of the file
			res.writeHead(200);
			res.end(data);
  		}
  	);

  	/*
  	res.writeHead(200);
  	res.end("Life is wonderful");
  	*/
}


// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io').listen(httpServer);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
	// We are given a websocket object in our function
	function (socket) {

		console.log("We have a new client: " + socket.id);
		users.push(socket.id);
		console.log(users.length);

		socket.on('wait', function(){
			io.sockets.emit('wait');
		});

		socket.on('scene1', function(){
      scene1_order = shuffle([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]);
			for(var i in users) {
				prompt = scene1_order[i];
				io.to(users[i]).emit('scene1', prompt);
				console.log(users[i] + " " + scene1_order[i]);
			}
		});

		socket.on('scene2', function(){
      var scene2_order = shuffle([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]);
			for(var i in users) {
				prompt = scene2_order[i];
				io.to(users[i]).emit('scene2', prompt);
				console.log(users[i] + " " + scene2_order[i]);
			}
		});

		socket.on('scene3', function(){
      var scene3_order = shuffle([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]);
			for(var i in users) {
				prompt = scene3_order[i];
				io.to(users[i]).emit('scene3', prompt);
				console.log(users[i] + " " + scene3_order[i]);
			}
		});

    socket.on('end', function(){
      io.sockets.emit('end');
    });


		// When this user emits, client side: socket.emit('otherevent',some data);
		socket.on('currentQuestion', function(data) {
			// Data comes in as whatever was sent, including objects
			console.log("Received: The question is:  " + data);

			// Send it to all of the clients
			// socket.broadcast.emit('currentQuestion', data);
			io.sockets.emit('currentQuestion', data);
			current_question = data;

		});


		socket.on('disconnect', function() {
			console.log("Client has disconnected " + socket.id);
			for (var i in users) {
				if (users[i] == socket.id) {
				users.splice(i, 1);
				console.log("User: " + socket.id + " removed.")
				console.log(users.length);
				};
			};
		});
	}
);
