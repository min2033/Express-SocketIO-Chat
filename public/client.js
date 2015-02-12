$(function(){

	var socket = io.connect(window.location.hostname);
//	var socket = io.connect('http://localhost:8000');	

	var name = '';
	while(name === ''){
		name = prompt('Name please');	
	}
	socket.emit('join',name);	

	socket.on('loadMessages',function(messages){
		$('.viewer').find('p').remove();
		messages.forEach(function(message){
		$('.viewer').prepend('<p>' + message.name + ': ' + message.message + '</p>');
		});

	});

	socket.on('add user', function(name){
		var chatter = $('<li>'+name+'</li>');
		chatter = chatter.attr('data-name',name);
		$('#users').append(chatter);
	});

	socket.on('remove user', function(name){
		console.log(name + ' disconnected');
		$('#users li[data-name='+name+']').remove();
	});
	
	$('#chat').on('submit',function(e){
		e.preventDefault();
		var field = $('input[type="text"]');
		var msg = field.val();
		sendMessage(name,msg);		
		field.val('');
	});

	function sendMessage(user,msg){
		var obj = {user:user,message:msg};
		socket.emit('userMsg',obj);
	}
});
