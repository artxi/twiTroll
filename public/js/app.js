const Socket = io.connect('/');

Socket.emit('getCurrentTargets');

Socket
	.on('currentTargets', data => {
		fillCurrentTargets(data);
	})
	.on('targetNotFound', () => {
		$('#errorLabel').text('User not found').show().delay(3000).fadeOut("slow");
		$('#newTargetName').val('')
	})
	.on('targetExists', () => {
		$('#errorLabel').text('Already trolled').show().delay(3000).fadeOut("slow");
		$('#newTargetName').val('')
	});

function fillCurrentTargets(targets) {
	$('#newTargetName').val('')
	$('#currentTargets').html('');
	console.log(targets);
	/*targets.forEach((target) => {
		
	})*/
}

$('#newTargetBtn').click(() => {
	Socket.emit('addNewTarget', $('#newTargetName').val().trim())
});