const Fs = require('fs');
const Logrotate = require('logrotator');
const colors = require('colors');

const Settings = require('../config/settings');
const Package = require('../package');

let rotator = Logrotate.rotator;

try {

	function registerLogFile(filePath) {
		rotator.register(filePath, {
			schedule: Settings.log.sizeCheckInterval,
			size: Settings.log.maxSize,
			compress: false,
			count: Settings.log.maxStoredFiles
		});
		rotator.on('error', (err) => {
			console.log('Logrotator error');
		});
	}

	registerLogFile(Settings.log.path);

	function getTimestamp() {
		let date = new Date();
		return `[${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.toLocaleTimeString('es-ES')}]`;
	}

	function write(message) {
		Fs.appendFile(Settings.log.path, message, function(err) {
			if (err) {
				return console.log(err);
			}
		});
	}

	function log(level, message) {
		switch (level) {
			case 'info':
				color = 'green';
				break;
			case 'warning':
				color = 'yellow';
				break;
			case 'error':
				color = 'red';
				break;
			default:
				color: 'green';
				break;
		}

		let finalMessage = `\n${getTimestamp()} [${level.toUpperCase()[color]}] ${message}`;
		write(finalMessage);
	}

	module.exports = {

		printInitInfo: () => {
			log('info', '\n\n');
			log('info', '------------------------------');
			log('info', '---------- twiTroll ----------');
			log('info', `----------- v${Package.version} -----------`);
			log('info', '------------------------------\n');
		},

		log: (message) => {
			log('info', message);
		},
		warn: (message) => {
			log('warning', message);
		},
		error: (message) => {
			log('error', message);
		}

	};

} catch (e) {
	log('error', e)
}
