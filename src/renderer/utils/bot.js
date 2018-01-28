import moment from 'moment';

import { API } from './chatUtils';

const placeholders = {
	'%uptime%': channel => {
		var time = 'Offline';
		API.getStreamInfo(channel).then(resp => {
			if (resp.stream) {
				time = moment.utc(moment.utc().diff(moment.utc(resp.stream.created_at))).format('HH:mm:ss');
			}
			return Promise.resolve(msg);
		});
	}
};

export const BOT = (() => {
	var commands = [],
		client;
	return {
		init(options) {
			commands = options.commands;
			client = options.client;
		},
		handleMessage(msg, user) {
			var command = commands.find(el => el.command === msg),
				matchesPromises = [];
			if (command) {
				let text = command.text,
					matches = text.match(/%(\w)+%/gi);

				if (matches) {
					matches.forEach(match => {
						if (placeholders[match]) {
							let promise = placeholders[match](clinet.getChannels()[0]).then(data => {
								text.replace(match, data);
							});
							matchesPromises.push(promise);
						}
					});
				}
			}
			return Promise.all(matchesPromises).then(data => {
				Proise.resolve(text);
			});
		}
	};
})();
