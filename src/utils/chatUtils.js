import googleTTS from 'google-tts-api';
import moment from 'moment';

import { KRAKEN_PREFIX_URL, TOKEN } from './constants.js';

export const API = {
	/**
	 * Gets audio url with  generated voice
	 * @param  {string} text Message which should pronounce
	 * @return {Promise}      Succes - link to url, err - orr object
	 */
	GetMessageAudio: text => {
		var lang = 'en';
		if (/[а-яА-ЯЁё]/.test(text)) {
			lang = 'ru-RU';
		}

		return googleTTS(text, lang);
	},
	getChannelInfo: channel => {
		return fetch(KRAKEN_PREFIX_URL + 'channels/' + channel, {
			headers: {
				'Client-ID': TOKEN
			}
		}).then(res => {
			if (res.status === 200) {
				return res.json();
			} else {
				return null;
			}
		});
	},
	getFollowersList: channel => {
		return fetch(KRAKEN_PREFIX_URL + 'channels/' + channel + '/follows', {
			headers: {
				'Client-ID': TOKEN
			}
		}).then(res => {
			if (res.status === 200) {
				return res.json();
			} else {
				return null;
			}
		});
	},
	getViewers: channel =>
		fetch(`https://tmi.twitch.tv/group/user/${channel}/chatters`).then(response => response.json()),
	getStreamInfo: function(channel) {
		return fetch(KRAKEN_PREFIX_URL + 'streams/' + channel, {
			headers: {
				'Client-ID': TOKEN
			}
		}).then(function(res) {
			if (res.status === 200) {
				return res.json();
			} else {
				return null;
			}
		});
	},
	sendMsg: function(client, msg, channel) {
		if (msg && msg.length) {
			client.say(channel, msg);
		}
	}
};

export const FollowersWatcher = (() => {
	var timer = null,
		followers = [];

	return {
		start: function(channel, listener) {
			if (timer) {
				this.stop();
			}
			timer = setInterval(() => {
				API.getFollowersList(channel).then(resp => {
					if (followers.length) {
						let diff = resp.follows.filter(
							follower => !followers.find(oldFollower => oldFollower.created_at === follower.created_at)
						);
						if (diff.length) {
							listener(diff);
						}
					}
					followers = resp.follows || [];
				});
			}, 3000);
		},
		stop: function() {
			clearInterval(timer);
			followers = [];
		}
	};
})();

export const BOT = (client, message, channel) => {
	channel = channel || client.getChannels()[0];
	var msg;
	console.log('message', message);
	console.log('channel', channel);
	if (message.indexOf('!uptime') === 0) {
		API.getStreamInfo(channel.slice('1')).then(function(resp) {
			console.log('resp', resp);
			if (resp.stream) {
				msg = 'Стрим идет: ' + moment.utc(moment.utc().diff(moment.utc(resp.stream.created_at))).format('HH:mm:ss');
			} else {
				msg = 'Стрим оффлайн, братишки.';
			}
			API.sendMsg(client, msg, channel);
		});
	} else if (message.toLowerCase().indexOf('ахуеть') === 0) {
		msg = '... Лысый, хто тут нарыгал?\n А я вступил - новые носки. Бля заебал!';
	} else if (message.indexOf('!pidor') === 0) {
		msg = '@' + userstate.username + ' - пидор.';
	} else if (message.indexOf('!roulette') === 0) {
		var rand = Math.random() * 10;
		if (rand < 5) {
			msg = '@' + userstate.username + ', повезло тебе, сучка!';
		} else {
			let banTime = Math.random() * 1000;
			msg = '@' + userstate.username + ', поздравляю братан. Ты заработал бан(' + Math.round(banTime) + 's)';
			API.timeoutUser(client, userstate.username, banTime, channel);
		}
	} else if (message.indexOf('!magicball') === 0) {
		if (message.indexOf('?') < 0) {
			msg = '@' + userstate.username + ', это не вопрос';
		} else {
			msg = '@' + userstate.username + ', ' + _.sample(config.messages.answers);
		}
	} else if (message.indexOf('!joke') === 0) {
		API.getJokes().then(
			function(data) {
				var joke = _.sample(data);
				API.sendMsg(
					client,
					joke.elementPureHtml.replace(/<[A-Za-z ='"#0-9]+\/?>/g, '').replace(/&[A-Za-z]+;/g, ''),
					channel
				);
			},
			function(err) {
				console.log('err', err);
			}
		);
	} else if (message.indexOf('!typidor') === 0) {
		if (args[1]) {
			msg = (args[1].indexOf(config.god) == -1 ? args[1] : userstate.username) + ', ты пидор!';
		}
	}
	// else if (message.indexOf(config.USER) != -1) {
	// 	msg = _.sample(config.messages.ascorbinka);
	// }
	API.sendMsg(client, msg, channel);

	return;
};
