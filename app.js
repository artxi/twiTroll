const Express = require('express');
const App = Express();
const Server = require('http').Server(App);
const Io = require('socket.io')(Server);
const Path = require('path');

const TwitterEvents = require('./modules/twitter');

TwitterEvents.getEventEmitter().on('newTweet', (newTweet) => {
	console.log(newTweet.text);
});

/** EXAMPLE
Io.on('connection', function(socket) {
	Io.emit('kk', {message: 'kkk'});
});
*/

App.get('/', function(req, res) {  
	res.sendFile(Path.resolve('public/views/index.html'));
});

App.use(Express.static('public'));

Server.listen(3001);