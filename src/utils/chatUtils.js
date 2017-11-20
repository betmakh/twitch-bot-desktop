import googleTTS from 'google-tts-api';
import _ from 'lodash';

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

// export const BOT = {
// 	start
// };
