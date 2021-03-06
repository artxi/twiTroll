const Logger = require('./logger');

try {

	const Twitter = require('./twitter');
	const Fs = require('fs');

	module.exports = {
		troll: (target, tweet) => {
			if (tweet.extended_tweet && tweet.extended_tweet.full_text && tweet.extended_tweet.full_text !== '') {
				tweet.text = tweet.extended_tweet.full_text;
			}
			switch (target.mode) {
				case 'mimimi':
					Twitter.replyText(target, tweet, mimimiText(tweet.text));
					break;
				case 'image':
					getRandomImageForTarget(target, tweet)
					break;
				default:
					Logger.warn('Mode not found');
					break;
			}
		}
	}

	function getRandomImageForTarget(target, tweet) {
		let imageDir = './target_data/' + target.screen_name + '/images/';
		Fs.readdir(imageDir, (err, data) => {
			if (data && data[0]) {
				Twitter.replyImage(target, tweet, imageDir + data[Math.floor(Math.random() * data.length)]);
			}
		});
	}


	function mimimiText(baseText) {
		baseText = baseText.replace(/(?:https?|ftp):\/[\n\S]+/g, '').trim();
		let wordArray = baseText.split(' ');
		let finalText = [];
		wordArray.forEach((word) => {
			if (word[0] === '@' || word[0] === '#') {
				finalText.push(word);
			} else {
				finalText.push(word
					.replace(/[aeou]/g, 'i')
					.replace(/[áéóú]/g, 'í')
					.replace(/[äëöü]/g, 'ï')
					.replace(/[àèòù]/g, 'ì')
					.replace(/[AEOU]/g, 'I')
					.replace(/[ÁÉÓÚ]/g, 'Í')
					.replace(/[ÄËÖÜ]/g, 'Ï')
					.replace(/[ÀÈÒÙ]/g, 'Ì'));
			}
		});
		return finalText.join(' ');
	}

} catch (e) {
	Logger.error(e);
}
