const Express = require('express');
const App = Express();
const Server = require('http').Server(App);
const Io = require('socket.io')(Server);
const Path = require('path');
const JsonFile = require('jsonfile');
const Fs = require('fs');
const Scheduler = require('node-schedule');

const Settings = require('./config/settings');
const Twitter = require('./modules/twitter');
const Troller = require('./modules/troller');
const Logger = require('./modules/logger');

Logger.printInitInfo();

createTargetDataDir();

function createTargetDataDir() {
	let targetDir = './target_data';
	if (!Fs.existsSync(targetDir)) {
		Fs.mkdirSync(targetDir);
	}
}

if (Settings['enable_11:11']) {
	Scheduler.scheduleJob('30 11 11 * * *', function() {
		Twitter.tweetText('11:11');
	});
}

Twitter.getEventEmitter()
	.on('newTweet', data => {
		if (data.target.mySelf) {
			//Logger.log('Trolling myself');
			//Troller.troll(data.target, data.newTweet);
		} else {
			let timeout = Math.floor(Math.random() * (Settings.replyTimeoutMinMax[1]) - Settings.replyTimeoutMinMax[0] + 1) + Settings.replyTimeoutMinMax[0];
			Logger.log(`Trolling ${data.target.name} in ${timeout} seconds`);
			setTimeout(() => {
				Troller.troll(data.target, data.newTweet);
			}, timeout * 1000);
		}
	})
	.on('updateTargetJson', targets => {
		saveJson('config/targets.json', targets)
	})
	.on('targetAdded', user => {
		Io.emit('targetAdded', user);
	})
	.on('targetExists', () => {
		Io.emit('targetExists');
	})
	.on('targetNotFound', () => {
		Io.emit('targetNotFound');
	})
	.on('targetDeleted', (name) => {
		Io.emit('targetDeleted', name);
	});

Io.on('connection', socket => {
	setSocketEvents(socket);
});

function saveJson(file, data) {
	JsonFile.writeFile(file, data, { spaces: 4 }, err => {
		if (err) {
			Logger.error(err);
		}
	});
}

function setSocketEvents(socket) {
	socket
		.on('getCurrentTargets', () => {
			socket.emit('currentTargets', Twitter.getCurrentTargets());
		})
		.on('addNewTarget', data => {
			Twitter.addUserData(data);
		})
		.on('deleteTarget', name => {
			Twitter.deleteTarget(name);
		});
}

App.get('/', (req, res) => {
	res.sendFile(Path.resolve('public/views/index.html'));
});

App.use(Express.static('public'));

Server.listen(Settings.port || 3000);
