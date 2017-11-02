const Twitter = require('./twitter');

module.exports = {
	troll: (target, tweet) => {
		switch (target.mode) {
			case "mimimi":
				Twitter.replyText(target, tweet, mimimiText(tweet.text));
				break;
			default:
				console.log("Mode not found");
				break;
		}
	}
}

function mimimiText(baseText) {
	return baseText.replace(/[aeou]/g, 'i')
		.replace(/[áéóú]/g, 'í')
		.replace(/[äëöü]/g, 'ï')
		.replace(/[àèòù]/g, 'ì')
		.replace(/[AEOU]/g, 'I')
		.replace(/[ÁÉÓÚ]/g, 'Í')
		.replace(/[ÄËÖÜ]/g, 'Ï')
		.replace(/[ÀÈÒÙ]/g, 'Ì')
		.replace(/(?:https?|ftp):\/[\n\S]+/g, '');
}