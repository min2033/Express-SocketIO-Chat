var express = require('express');
var app = express();
var server = require('http').createServer(app);

// Socket IO
var io = require('socket.io')(server);

// Redis DB 
var redis = require('redis');
var url = require('url');
var redisURL = url.parse(process.env.REDISCLOUD_URL);
var redisClient = redis.createClient(redisURL.port,redisURL.hostname, {no_ready_check: true});
redisClient.auth(redisURL.auth.split(":")[1]);

redisClient.on('error',function(err){
	console.log(err);
});

app.set('port',(process.env.PORT || 5000));
app.use(express.static('public'));

app.get('/',function(req,res){
	res.sendFile();
});

io.sockets.on('connection',function(client){
	console.log('client connected');
	
	client.on('join',function(name){
		console.log(name + ' connected');
		storeMsg(name,' has connected.','messages');
		storeMsg(name,'','users');
		client.name = name;
		sendMsg(client,'messages');
		sendMsg(client,'users');
	});
	
	client.on('disconnect',function(){
		console.log("user disconnected");
		storeMsg(client.name,' has disconnected.','messages');
		removeMsg(client.name,'','users');
		sendMsg(client,'messages');
		sendMsg(client,'users');
	});
	
	client.on('userMsg',function(data){
		storeMsg(data.user,data.message,'messages');
		sendMsg(client,'messages');
	});

});

function storeMsg(name, msg, storage){
	if(storage === 'messages'){
		//store messages
		var jsonMsg = JSON.stringify({name:name,message:msg});
		redisClient.lpush('messages',jsonMsg,function(err,reply){
		redisClient.ltrim('messages',0,9);});
	}else if(storage === 'users'){
		//store user
		var jsonMsg = JSON.stringify({user:name});
		redisClient.lpush('users',jsonMsg,function(err,reply){
		redisClient.ltrim('users',0,9);});
	}
}

function removeMsg(name,storage){
	redisClient.lrem('users',-1,name,function(err,reply){
		console.log(reply);	
		console.log(err);
	});
}

function sendMsg(client,storage){
	if(storage === 'messages'){
	redisClient.lrange('messages',0,-1,function(err,data){
		data = data.map(function(line){return line = JSON.parse(line);}).reverse();
		// or just data = data.map(JSON.parse);
		client.emit('loadMessages',data);
		client.broadcast.emit('loadMessages',data);
	});
	}else if(storage === 'users'){
	redisClient.lrange('users',0,-1,function(err,data){
		data = data.map(JSON.parse);
		client.emit('loadUsers',data);
		client.broadcast.emit('loadUsers',data);
	});	
	}
}	

server.listen(app.get('port'),function(){
	console.log('Server is listening on port '+ app.get('port'));
});
