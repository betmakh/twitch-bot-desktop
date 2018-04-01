const KRAKEN_PREFIX_URL = 'https://api.twitch.tv/kraken/';
const TWITCH_API_PREFIX_URL = 'https://api.twitch.tv/helix/';
const TOKEN = 'o9gnnqnx1sxt6twajj6h7u4w7ko6bhj';

const data = {
	usersData: new Map(),
	channelsChatters: new Map()
};

const chattersPerRequest = 99;

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

		// return Promise.resolve(dataToResolve);
	});
};

// get initial users list and users data
const getChatters = function(params) {
	var { channel } = params,
		dataToResponse = [],
		responseSize = 0,
		chattersCount = 0,
		usersWithoutData = [];

	return fetch(`https://tmi.twitch.tv/group/user/${channel}/chatters`)
		.then(response => response.json())
		.then(resp => {
			chattersCount = resp.chatter_count;
			responseSize = chattersCount >= chattersPerRequest ? chattersPerRequest : chattersCount;
			//detect users who requires data
			for (var i in resp.chatters) {
				for (var j = 0; j < resp.chatters[i].length; j++) {
					if (!data.usersData.has(resp.chatters[i][j])) {
						usersWithoutData.push(resp.chatters[i][j]);
					} else if (dataToResponse.length < responseSize) {
						dataToResponse.push(data.usersData.get(resp.chatters[i][j]));
					}
				}
			}
			data.channelsChatters.set(channel, resp);
			return usersWithoutData;
		})
		.then(updateUsersData)
		.then(users => {
			while (dataToResponse.length < responseSize) {
				let userName = usersWithoutData.shift();
				dataToResponse.push(data.usersData.get(userName) || { login: userName });
			}

			var dataToSend = {
				users: dataToResponse,
				totalUsersCount: chattersCount
			};
			return dataToSend;
		});
};

// filter users by name. data taken from 'chatters-get'
const filterChatters = function(params) {
	var { channel, query } = params;
	var resp = data.channelsChatters.get(channel, resp);
	if (resp) {
		var filtered = [],
			dataToSend = [],
			usersWithoutData = [];
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
		return updateUsersData(usersWithoutData).then(users => {
			dataToSend = dataToSend.concat(users);
			return {
				users: dataToSend,
				totalUsersCount: resp.chatter_count
			};
		});
	} else {
		return {
			error: "Please refresh the users's list"
		};
	}
};

onmessage = function(msg) {
	var { type } = msg.data;
	if (type === 'filter') {
		filterChatters(msg.data).then(resp => {
			postMessage(resp);
		});
	} else {
		getChatters(msg.data).then(resp => {
			postMessage(resp);
		});
	}
};
