//@GnSoft 2016 (mobileteamdeveloper@gmail.com)
//Setup express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

server.listen(port, function () {
	console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/views'));
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/views/index.html');
});
app.get('/home', function (req, res) {
  res.sendfile(__dirname + '/views/home.html');
});

//
var homeStatus = {};
//
io.on('connection', function(socket){

	socket.mame = null;
	socket.room = null;
	//
	socket.on('homeRegister', function(data){
		console.log("homeRegister - id:"+socket.id);
		socket.mame = "home";
		//sendHomeStatusToDevice(true);
		socket.room = 'H'+socket.id;
		socket.join('H'+socket.id);
		homeStatus[socket.room] = data;
		socket.emit('join-homeID', socket.room);
	});
	//
	socket.on('deviceRegister', function(data){
		console.log("deviceRegister - id:"+socket.id+" , homeID:"+data);
		if(homeStatus.hasOwnProperty(data)){
			socket.room = data;
			socket.join(data);
			sendHomeStatusToDevice();
		} else{
			socket.emit('deviceJoinHomeError');
		}
	});
	
	//
	socket.on('action-DeviceToServer', function(data){
		if(!homeStatus[socket.room].homeRegistered)return;
		console.log("action-DeviceToServer: "+data.action+"="+data.value);
		if(data.action === "atHome"){
			if(homeStatus[socket.room].hasOwnProperty(data.action))homeStatus[socket.room][data.action] = data.value;
			return;
		}
		socket.broadcast.to(socket.room).emit('action-ServerToHome', data);
	});
	//
	socket.on('action-HomeToServer', function(data){
		if(homeStatus[socket.room].hasOwnProperty(data.action))homeStatus[socket.room][data.action] = data.value;
		socket.broadcast.to(socket.room).emit('action-ServerToDevice', data);
	});
	//
	socket.on('callback-HomeToServer', function(data){
		if(homeStatus[socket.room].hasOwnProperty(data.action))homeStatus[socket.room][data.action] = data.value;
		socket.broadcast.to(socket.room).emit('callback-ServerToDevice', data);
	});
	//
	socket.on('disconnect', function(){
		if(socket.mame == "home"){
			console.log("disconnect - homeID:"+socket.room);
			homeStatus[socket.room].homeRegistered = false;
			sendHomeStatusToDevice(true);
			delete homeStatus[socket.room];
		}
	});
	//
	function sendHomeStatusToDevice(myHome){
		console.log("homeStatus-ServerToDevice, homeRegistered:"+homeStatus.homeRegistered);
		if(myHome){
			socket.broadcast.to(socket.room).emit('homeStatus-ServerToDevice', homeStatus[socket.room]);
		} else{
			socket.emit('homeStatus-ServerToDevice', homeStatus[socket.room]);
		}
	}
});

