const Twit = require('twit');
const Twitter = new Twit(require('../config/auth'));
const Events = require('events');
const EventEmitter = new Events.EventEmitter();

let targets = require('../config/targets');
let stream = Twitter.stream('statuses/filter', { follow: getTargetIds() });

stream.on('tweet', (newTweet) => {
	if (checkUserIdStr(newTweet.user.id_str)) {
		console.log(`New tweet from ${newTweet.user.name}!`);
		if (newTweet.retweeted_status || newTweet.text.substring(0, 2) === 'RT') {
			console.log('It\'s a retweet :(');
		} else {
			if (newTweet.is_quote_status || newTweet.in_reply_to_status_id) {
				console.log('It\'s a reply :(');
			} else {
				EventEmitter.emit('newTweet', newTweet)
				console.log(`Trolling ${newTweet.user.name}`);
			}
		}
	} else {
		console.log('Just interaction');
	}
});

function tweetText(text) {
	Twitter.post('statuses/update', { status: text }, (err, data, response) => {
		console.log(`Tweeted ${data.text}`);
	})
}

function getTargetIds() {
	let targetIds = [];
	targets.forEach((target) => {
		targetIds.push(target.id)
	});
	return targetIds;
}

function addNewTarget(screen_name) {
	if (checkUserScreenName(screen_name)) {
		EventEmitter.emit('targetExists', screen_name);
	} else {
		Twitter.get('users/show', { screen_name: screen_name }, function(err, data, response) {
			if (data && !data.errors) {
				targets.push({
					"id": data.id_str,
					"screen_name": data.screen_name,
					"name": data.name,
					"image": data.profile_image_url,
					"background": data.profile_background_image_url,
					"enabled": true
				});
				EventEmitter.emit('targetAdded', targets)
				updateTargetJson();
			} else {
				EventEmitter.emit('targetNotFound', screen_name);
			}
		});
	}
}

function checkUserScreenName(screen_name) {
	return targets.some(function(target) {
		return target.screen_name === screen_name;
	});
}

function checkUserIdStr(id) {
	return targets.some(function(target) {
		return target.id === id;
	});
}

function updateTargetJson() {
	EventEmitter.emit('updateTargetJson', targets)
}

module.exports = {
	getEventEmitter: () => EventEmitter,
	getCurrentTargets: () => targets,
	addUserData: (user) => addNewTarget(user),
	tweetText: (text) => tweetText(text)
}