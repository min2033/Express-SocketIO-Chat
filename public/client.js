$(function(){

	var socket = io.connect(window.location.hostname);
	
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
	
	socket.on('add user',function(user){
		$('#users').find('li').remove();
		console.log(user);
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
