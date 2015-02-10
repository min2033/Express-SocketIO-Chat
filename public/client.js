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
	
	socket.on('loadUsers',function(users){
		$('#users').find('li').remove();
		users.forEach(function(user){
		$('#users').prepend('<li>' + user.user + '</li>');
		});	
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
