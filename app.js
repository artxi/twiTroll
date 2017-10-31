const Express = require('express');
const App = Express();
const Server = require('http').Server(App);
const Io = require('socket.io')(Server);
const Path = require('path');
const JsonFile = require('jsonfile');

const Twitter = require('./modules/twitter');

let browserSocket;

Twitter.getEventEmitter()
	.on('newTweet', newTweet => {
		console.log(newTweet.text);
	})
	.on('updateTargetJson', targets => {
		saveJson('config/targets.json', targets)
	})
	.on('targetAdded', targets => {
		browserSocket.emit('currentTargets', targets);
	})
	.on('targetExists', () => {
		browserSocket.emit('targetExists');
	})
	.on('targetNotFound', () => {
		browserSocket.emit('targetNotFound');
	});

Io.on('connection', socket => {
	setSocketEvents(socket);
});

function saveJson(file, data) {
	JsonFile.writeFile(file, data, { spaces: 4 }, err => {
		if (err) {
			console.error(err)
		}
	})
}

function setSocketEvents(socket) {
	browserSocket = socket;
	socket
		.on('getCurrentTargets', () => {
			socket.emit('currentTargets', Twitter.getCurrentTargets());
		})
		.on('addNewTarget', data => {
			Twitter.addUserData(data);
		});
}

App.get('/', (req, res) => {
	res.sendFile(Path.resolve('public/views/index.html'));
});

App.use(Express.static('public'));

Server.listen(3001);