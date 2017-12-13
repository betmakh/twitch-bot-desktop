import { KRAKEN_PREFIX_URL, TOKEN, TWITCH_API_PREFIX_URL } from '../../utils/constants.js';
import { ipcMain } from 'electron';
import fetch from 'node-fetch';

var data = {
	usersData: new Map(),
	channelsChatters: new Map()
};

const updateUsersData = users => {
	const maxUserPerRequest = 100;
	var url = `${TWITCH_API_PREFIX_URL}users?`,
		requests = [];

	let iterator = 0;
	while (iterator < users.length) {
		let current = users.slice(iterator, iterator + maxUserPerRequest);
		requests.push(
			fetch(url + `login=${current.join('&login=')}`, {
				headers: {
					'Client-ID': TOKEN
				}
			}).then(resp => {
				if (resp.status === 200) {
					return resp.json();
				} else {
					return Promise.resolve(null);
				}
			})
		);
		iterator += maxUserPerRequest;
	}
	return Promise.all(requests).then(responses => {
		responses.forEach(el => {
			if (el) {
				for (let i = 0; i < el.data.length; i++) {
					if (!data.usersData.has(el.data[i].login)) {
						data.usersData.set(el.data[i].login, el.data[i]);
					}
				}
			}
		});
		console.log('data.usersData', data.usersData.size);
		return Promise.resolve(data.usersData);
	});
};

ipcMain.on('chatters-get', (event, channel) => {
	fetch(`https://tmi.twitch.tv/group/user/${channel}/chatters`)
		.then(response => response.json())
		.then(resp => {
			var singleList = [];
			for (var i in resp.chatters) {
				resp.chatters[i].forEach(el => {
					if (!data.usersData.has(el)) {
						singleList.push(el);
					}
				});
			}
			updateUsersData(singleList).then(users => {
				console.log('users', users);
				event.sender.send('chatters-received', users.size);
			});
			data.channelsChatters.set(channel, resp.chatters);
		});
});

ipcMain.on('chatters-filter', (event, channel, query) => {
	fetch(`https://tmi.twitch.tv/group/user/${channel}/chatters`)
		.then(response => response.json())
		.then(resp => {
			data.channelsChatters.set(channel, resp.chatters);
		});
	jsonfile.readFile(configFilePath, (err, data) => {
		if (!err) {
			event.sender.send('settings-updated', data);
		} else {
			event.sender.send('error', err);
		}
	});
});
