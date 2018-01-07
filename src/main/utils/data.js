import { KRAKEN_PREFIX_URL, TOKEN, TWITCH_API_PREFIX_URL } from '../../utils/constants.js';
import { ipcMain } from 'electron';
import fetch from 'node-fetch';

var data = {
	usersData: new Map(),
	channelsChatters: new Map()
};

const chattersPerRequest = 100;

// get and store usersData(avatars)
const updateUsersData = users => {
	var url = `${TWITCH_API_PREFIX_URL}users?`,
		requests = [];

	if (!users.length) {
		return Promise.resolve([]);
	}

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
		return new Promise((resolve, reject) => {
			process.nextTick(() => {
				var dataToResolve = [];
				responses.forEach(el => {
					if (el) {
						for (let i = 0; i < el.data.length; i++) {
							data.usersData.set(el.data[i].login, el.data[i]);
							dataToResolve.push(el.data[i]);
						}
					}
				});
				resolve(dataToResolve);
			});
		});
		
		// return Promise.resolve(dataToResolve);
	});
};

// get initial users list and users data
ipcMain.on('chatters-get', (event, channel) => {
	fetch(`https://tmi.twitch.tv/group/user/${channel}/chatters`)
		.then(response => response.json())
		.then(resp => {
			var usersWithoutData = [],
				dataToResponse = [],
				responseSize = resp.chatter_count >= chattersPerRequest ? chattersPerRequest : resp.chatter_count;
			//detect users who requires data
			for (var i in resp.chatters) {
				resp.chatters[i].forEach(el => {
					if (!data.usersData.has(el)) {
						usersWithoutData.push(el);
					} else if (dataToResponse.length < responseSize) {
						dataToResponse.push(data.usersData.get(el));
					}
				});
			}
			data.channelsChatters.set(channel, resp);
			process.nextTick(() => {
				updateUsersData(usersWithoutData).then(users => {
					while (dataToResponse.length < responseSize) {
						let userName = usersWithoutData.shift();
						dataToResponse.push(data.usersData.get(userName) || { login: userName });
					}

					var dataToSend = {
						users: dataToResponse,
						totalUsersCount: resp.chatter_count
					};
					event.sender.send('chatters-received', dataToSend);
				});
			});
		});
});

// filter users by name. data taken from 'chatters-get'
ipcMain.on('chatters-filter', (event, channel, query) => {
	var resp = data.channelsChatters.get(channel, resp);
	if (resp) {
		var filtered = [],
			dataToSend = [],
			usersWithoutData = [];
		process.nextTick(() => {
			for (var i in resp.chatters) {
				filtered = filtered.concat(
					resp.chatters[i].filter(login => {
						if (!data.usersData.has(login)) {
							usersWithoutData.push(login);
						}
						return !!~login.toUpperCase().indexOf(query.toUpperCase());
					})
				);
			}

			while (dataToSend.length < chattersPerRequest && dataToSend.length < filtered.length) {
				let login = filtered[dataToSend.length];
				if (data.usersData.has(login)) {
					dataToSend.push(data.usersData.get(login));
				} else {
					usersWithoutData.push(login);
				}
			}
			updateUsersData(usersWithoutData).then(users => {
				
				dataToSend = dataToSend.concat(users);
				event.sender.send('chatters-received', {
					users: dataToSend,
					totalUsersCount: resp.chatter_count
				});
			});
		});
	} else {
		event.sender.send('chatters-received', {
			error: "Please refresh the users's list"
		});
	}
});
