import googleTTS from 'google-tts-api';
import Sound from 'react-sound';

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

export const SoundStatus = Object.assign(Sound.status, { QUEUED: 'QUEUED' });

export const API = {
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
