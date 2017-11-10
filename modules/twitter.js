const Twit = require('twit');
const Twitter = new Twit(require('../config/auth'));
const Events = require('events');
const EventEmitter = new Events.EventEmitter();
const Fs = require('fs');

const Logger = require('./logger');

let targets = require('../config/targets');
let stream = Twitter.stream('statuses/filter', { follow: getTargetIds(), tweet_mode: 'extended' });

stream.on('tweet', (newTweet) => {
	if (checkUserIdStr(newTweet.user.id_str)) {
		Logger.log(`New tweet from ${newTweet.user.name}!`);
		if (newTweet.retweeted_status || newTweet.text.substring(0, 2) === 'RT') {
			Logger.log('It\'s a retweet :(');
		} else {
			if (newTweet.in_reply_to_status_id || (newTweet.is_quote_status && (!newTweet.text || newTweet.text === ''))) {
				Logger.log('It\'s a reply :(');
			} else {
				if (getTargetByIdStr(newTweet.user.id_str).enabled) {
					EventEmitter.emit('newTweet', {
						newTweet: newTweet,
						target: getTargetByIdStr(newTweet.user.id_str)
					});
				} else {
					Logger.log(`${newTweet.user.name} blocked us :(`);
				}
			}
		}
	} else {
		//Logger.log('Just interaction');
	}
});

function tweetText(text) {
	Twitter.post('statuses/update', { status: text }, (err, data, response) => {
		if (err) {
			Logger.error(err);
		}
		Logger.log(`Tweeted ${data.text}!`);
	});
}

function replyText(target, tweet, text) {
	Twitter.post('statuses/update', {
		in_reply_to_status_id: tweet.id_str,
		status: getFirst140('@' + target.screen_name + ' ' + text)
	}, (err, data, response) => {
		if (err) {
			Logger.warn(`BLOCKED? ${err}`)
			/*target.blocked = true;
			updateTargetJson();*/
		} else {
			Logger.log(`Tweeted ${data.text}!`);
		}
	});
}

function replyImage(target, tweet, image) {
	var b64content = Fs.readFileSync(image, { encoding: 'base64' });
	Twitter.post('media/upload', {
		media_data: b64content
	}, (err, data, response) => {
		if (err) {
			Logger.error('ERROR:');
			Logger.error(err);
		} else {
			Twitter.post('statuses/update', {
				media_ids: new Array(data.media_id_string),
				in_reply_to_status_id: tweet.id_str,
				status: '@' + target.screen_name + ' '
			}, (err, data, response) => {
				if (err) {
					Logger.error('ERROR:');
					Logger.error(err);
				} else {
					Logger.log(`Replied ${target.name} with an image!`);
				}
			});
		}
	});
}

function getTargetByIdStr(idStr) {
	return targets.filter((target) => {
		return target.id === idStr;
	})[0];
}

function getTargetIds() {
	let targetIds = [];
	targets.forEach((target) => {
		targetIds.push(target.id);
	});
	return targetIds;
}

function addNewTarget(formData) {
	if (checkUserScreenName(formData.screen_name)) {
		EventEmitter.emit('targetExists', formData.screen_name);
	} else {
		Twitter.get('users/show', { screen_name: formData.screen_name }, function(err, data, response) {
			if (data && !data.errors) {
				createTargetDataDir(data.screen_name);
				Logger.log(`Adding ${data.name} as target`);
				targets.push({
					'id': data.id_str,
					'screen_name': data.screen_name,
					'name': data.name,
					'image': data.profile_image_url,
					'background': data.profile_background_image_url,
					'enabled': true,
					'blocked': false,
					'mode': formData.mode
				});
				followUser(data)
			} else {
				EventEmitter.emit('targetNotFound', formData.screen_name);
			}
		});
	}
}

function followUser(userData) {
	Logger.log(`Following ${userData.name} :)`);
	Twitter.post('friendships/create', { user_id: userData.id_str }, (err, data, response) => {
		if (err) {
			Logger.error(err);
		}		
		EventEmitter.emit('targetAdded', targets)
		updateTargetJson();
	});
}

function createTargetDataDir(name) {
	let targetDir = './target_data/' + name;
	if (!Fs.existsSync(targetDir)) {
		Fs.mkdirSync(targetDir);
		Fs.mkdirSync(targetDir + '/images');
	}
}

function checkUserScreenName(screen_name) {
	return targets.some(function(target) {
		return target.screen_name.toLowerCase() === screen_name.toLowerCase();
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

function getFirst140(text) {
	return (text.length > 140) ? text.substring(0, 140) : text;
}

module.exports = {
	getEventEmitter: () => EventEmitter,
	getCurrentTargets: () => targets,
	addUserData: (data) => addNewTarget(data),
	tweetText: (text) => tweetText(text),
	replyText: (target, tweet, text) => replyText(target, tweet, text),
	replyImage: (target, tweet, image) => replyImage(target, tweet, image)
}