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
	$('#chat').on('submit',function(e){
		e.preventDefault();
		var field = $('input[type="text"]');
		var msg = field.val();
		var obj = {user:name,message:msg};
		socket.emit('userMsg',obj);
		field.val('');
	});
});
