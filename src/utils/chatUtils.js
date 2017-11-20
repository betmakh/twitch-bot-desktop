import googleTTS from 'google-tts-api';

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
		fetch(`https://tmi.twitch.tv/group/user/${channel}/chatters`).then(response => response.json())
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

export const BOT = (msg, client) => {
	if (message.indexOf('!uptime') === 0) {
		utils.getChannelInfo(channel.slice('1')).then(function(resp) {
			console.log('resp', resp);
			if (resp.stream) {
				msg =
					'Стрим идет: ' +
					moment.utc(moment.utc().diff(moment.utc(resp.stream.created_at))).format('HH:mm:ss');
			} else {
				msg = 'Стрим оффлайн, братишки.';
			}
			utils.sendMsg(client, msg, channel);
		});
	} else if (message.toLowerCase().indexOf('ахуеть') === 0) {
		msg = config.messages['jockeAboutLysyi'][0];
	} else if (message.indexOf('!pidor') === 0) {
		msg = '@' + userstate.username + ' - пидор.';
	} else if (isAhuel) {
		if (ahuevshie[userstate.username] == 2) {
			msg = '@' + userstate.username + ', еще раз такое напишешь - я тебе круглой скобочкой по еблищу дам!';
		} else if (ahuevshie[userstate.username] > 2) {
			msg = '@' + userstate.username + ', ну все сука, ты отгребаешь!';
			utils.timeoutUser(client, userstate.username, ahuevshie[userstate.username] * 100, channel);
		} else {
			msg = '@' + userstate.username + ', не делай так.';
		}
	} else if (message.indexOf('!roulette') === 0) {
		var rand = Math.random() * 10;
		if (rand < 5) {
			msg = '@' + userstate.username + ', повезло тебе, сучка!';
		} else {
			let banTime = Math.random() * 1000;
			msg = '@' + userstate.username + ', поздравляю братан. Ты заработал бан(' + Math.round(banTime) + 's)';
			utils.timeoutUser(client, userstate.username, banTime, channel);
		}
	} else if (message.indexOf('!magicball') === 0) {
		if (message.indexOf('?') < 0) {
			msg = '@' + userstate.username + ', это не вопрос';
		} else {
			msg = '@' + userstate.username + ', ' + _.sample(config.messages.answers);
		}
	} else if (message.indexOf('!joke') === 0) {
		utils.getJokes().then(
			function(data) {
				var joke = _.sample(data);
				utils.sendMsg(
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
	} else if (message.indexOf(config.USER) != -1) {
		msg = _.sample(config.messages.ascorbinka);
	} else {
		utils.sayText(message);
	}
	return;
};
