const Twit = require('twit');
const Twitter = new Twit(require('../settings/auth'));
const Events = require('events');
const EventEmitter = new Events.EventEmitter();

let targets = require('../settings/targets');
let stream = Twitter.stream('statuses/filter', targets);

stream.on('tweet', (newTweet) => {
	if (targets.follow.includes(newTweet.user.id_str)) {
		console.log(`Trolling ${newTweet.user.name}`);
		if (newTweet.retweeted_status || newTweet.text.substring(0, 2) === 'RT') {
			console.log('It\'s a retweet :(');
		} else {
			if (newTweet.is_quote_status || newTweet.in_reply_to_status_id) {
				console.log('It\'s a reply :(');
			} else {
				EventEmitter.emit('newTweet', newTweet)
			}		
		}
	} else {
		console.log('Just interaction');
	}
});

module.exports = {
	getEventEmitter: () => EventEmitter
}