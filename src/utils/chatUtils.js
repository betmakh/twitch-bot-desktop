import googleTTS from 'google-tts-api';

import { KRAKEN_PREFIX_URL, TOKEN } from './constants.js';

/**
 * Gets audio url with  generated voice
 * @param  {string} text Message which should pronounce
 * @return {Promise}      Succes - link to url, err - orr object
 */
export const GetMessageAudio = text => {
	var lang = 'en';
	if (/[а-яА-ЯЁё]/.test(text)) {
		lang = 'ru-RU';
	}

	return googleTTS(text, lang);
};

export const API = {
	getFollowersList: channel => {
		console.log('KRAKEN_PREFIX_URL', KRAKEN_PREFIX_URL);
		console.log('TOKEN', TOKEN);
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
	//  timeoutUser: (client, user, time, channel) => {
	//     if (channel) {
	//         client.timeout(channel, user, time);
	//     } else {
	//         config.CHANNELS.forEach(function(ch) {
	//             client.timeout(ch, user, time);
	//         })
	//     }
	// }
};
