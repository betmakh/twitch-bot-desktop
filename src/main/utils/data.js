import { KRAKEN_PREFIX_URL, TOKEN, TWITCH_API_PREFIX_URL } from '../../utils/constants.js';
import { ipcMain } from 'electron';
import fetch from 'node-fetch';

var data = {
	usersData: new Map(),
	channelsChatters: new Map()
};

const chattersPerRequest = 100;

const updateUsersData = users => {
	var url = `${TWITCH_API_PREFIX_URL}users?`,
		requests = [];

	let iterator = 0;
	while (iterator < users.length) {
		let current = users.slice(iterator, iterator + chattersPerRequest);
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
		iterator += chattersPerRequest;
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
		return Promise.resolve(data.usersData);
	});
};

ipcMain.on('chatters-get', (event, channel) => {
	fetch(`https://tmi.twitch.tv/group/user/${channel}/chatters`)
		.then(response => response.json())
		.then(resp => {
			var usersWithoutData = [],
				dataToResponse = [];
			//detect users who requires data
			for (var i in resp.chatters) {
				resp.chatters[i].forEach(el => {
					if (!data.usersData.has(el)) {
						usersWithoutData.push(el);
					} else {
						dataToResponse.push(data.usersData.get(el));
					}
				});
			}
			updateUsersData(usersWithoutData).then(users => {
				console.log('resp.chatter_count', resp.chatter_count);
				if (resp.chatter_count >= chattersPerRequest) {
					while (dataToResponse.length < chattersPerRequest) {
						let userName = usersWithoutData.shift();
						dataToResponse.push(data.usersData.get(username) || { login: username });
					}
				} else {
					while (dataToResponse.length < resp.chatter_count) {
						let userName = usersWithoutData.shift();
						dataToResponse.push(data.usersData.get(username) || { login: username });
					}
				}
				var dataTosend = {
					users: dataToResponse,
					totalUsersCount: resp.chatter_count
				};
				event.sender.send('chatters-received', dataTosend);
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
