import moment from 'moment';

import { API } from './chatUtils';

const placeholders = {
	'%game%': channel => {
		return API.getStreamInfo(channel).then(resp => {
			return Promise.resolve((resp.stream && resp.stream.game) || 'unknown');
		});
	},
	'%username%': (channel, user) => Promise.resolve(user.username),
	'%uptime%': channel => {
		var time = 'offline';
		return API.getStreamInfo(channel).then(resp => {
			if (resp.stream) {
				time = moment.utc(moment.utc().diff(moment.utc(resp.stream.created_at))).format('HH:mm:ss');
			}
			return Promise.resolve(time);
		});
	}
};

const BOT = (() => {
	var commands = [],
		client;
	return {
		init(options) {
			commands = options.commands;
			client = options.client;
		},
		handleMessage(msg, user) {
			var command = commands.find(el => el.command === msg),
				matchesPromises = [],
				channel = client.getChannels()[0].slice(1),
				text;
			if (command) {
				text = command.text;
				let matches = text.match(/%(\w)+%/gi);

				if (matches) {
					matches.forEach(match => {
						if (placeholders[match]) {
							matchesPromises.push(
								placeholders[match](channel, user).then(data => {
									text = text.replace(match, data);
								})
							);
						}
					});
				}
			}
			return Promise.all(matchesPromises).then(() =>
				Promise.all([API.sendAction(client, text, channel), Promise.resolve(text)])
			);
		}
	};
})();

export default BOT;
