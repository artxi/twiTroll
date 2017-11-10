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
	})
	.on('targetAdded', (user) => {
		showNewUser(user);
	});

function fillCurrentTargets(users) {
	$('#newTargetName').val('')
	$('#currentTargets').html('');
	users.forEach((user) => {
		showNewUser(user);
	});
}

function showNewUser(user) {
	let userDiv = document.createElement('div');
	userDiv.className = 'userDiv';
	userDiv.id = user.screen_name;

	let userBackground = document.createElement('div');
	userBackground.className = 'userBackground';
	if (user.background) {
		userBackground.style.backgroundImage = `url('${user.background}')`;
	}
	userDiv.appendChild(userBackground);

	let imageDiv = document.createElement('div');
	imageDiv.className = 'userImageDiv';
	if (user.image) {
		let userImage = document.createElement('img');
		userImage.className = 'userImage';
		userImage.src = user.image;
		imageDiv.appendChild(userImage);
	}
	userDiv.appendChild(imageDiv);

	let userData = document.createElement('div');
	userData.className = 'userDataDiv';

	let userName = document.createElement('label');
	userName.className = 'userName';
	userName.innerHTML = user.name;
	userData.appendChild(userName);

	let trollMode = document.createElement('label');
	trollMode.className = 'trollMode';
	trollMode.innerHTML = '<br>' + user.mode;
	userData.appendChild(trollMode);
	userDiv.appendChild(userData);

	document.getElementById('currentTargets').appendChild(userDiv);
	$('#newTargetName').val('');
}

$('#newTargetBtn').click(() => {
	Socket.emit('addNewTarget', {
		screen_name: $('#newTargetName').val().trim(),
		mode: $('#modeSelect').find(":selected").text()
	})
});