import moment from 'moment';

import { API } from './chatUtils';

const processWord = (placeholder, msg) => {
	const staticHolders = {
		'%joke%': () =>
			API.getJoke().then(
				data => {
					var joke = data[0];
					return Promise.resolve(
						joke.elementPureHtml.replace(/<\/?[A-Za-z ='"#0-9]+\/?>/g, '').replace(/&[A-Za-z]+;/g, '')
					);
				},
				err => Promise.resolve(err)
			),
		'%game%': channel => {
			return API.getStreamInfo(channel).then(resp => {
				return Promise.resolve((resp.stream && resp.stream.game) || 'unknown');
			});
		},
		'%magicball%': () => {
			var answers = ['Да', 'Нет', 'Ты конч такие вопросы задавать?', 'Определенно нет', 'Базарю, инфа сотка'];
			return Promise.resolve(answers[Math.round(Math.random() * answers.length)]);
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

	if (placeholder in staticHolders) {
		return staticHolders[placeholder];
	}

	return () => {
		var result = '';
		// arguments of command
		if (/^%arg(\d)+%$/i.test(placeholder)) {
			let argNumber = parseInt(placeholder.match(/\d+/g)[0]);
			result = msg.split(' ')[argNumber];
		}

		return Promise.resolve(result);
	};
};

const bot = (() => {
	var commands = [],
		client;
	return {
		setCommands(cmnds) {
			commands = cmds;
			return this;
		},
		handleMessage(msg, user, commands, client) {
			var command = commands.find(el => !msg.indexOf(el.command)),
				matchesPromises = [],
				channel = client.getChannels()[0].slice(1),
				text;
			if (command) {
				text = command.text;
				let matches = text.match(/%(\w)+%/gi);

				if (matches) {
					matches.forEach(match => {
						let replacer = processWord(match, msg);
						console.log('replacer', replacer);
						if (replacer) {
							matchesPromises.push(
								replacer(channel, user).then(data => {
									text = text.replace(match, data);
								})
							);
						}
					});
				}
			}

			return Promise.all(matchesPromises).then(() => {
				console.log('text', text);
				return Promise.all([API.sendAction(client, text, channel), Promise.resolve(text)]);
			});
		}
	};
})();

export default bot;
