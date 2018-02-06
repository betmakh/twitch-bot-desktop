import BOT from './bot';

const ChatMediator = (() => {
	var TwitchClient,
		listeners = {
			chat: []
		};
	return {
		init(client) {
			TwitchClient = client;
			TwitchClient.removeAllListeners('chat');
			TwitchClient.on('chat', (channel, userstate, message, byOwn) => {
				var msg = {
					user: userstate,
					text: message,
					id: Date.now(),
					byOwn
				};
				listeners.chat.forEach(handler => {
					handler(msg);
				});
			});
			return this;
		},
		addListener(type, handler) {
			if (!~listeners[type].indexOf(handler)) {
				listeners[type].push(handler);
			}
			return this;
		},
		removeListener(type, handler) {
			if (handler) {
				listeners[type].splice(listeners[type].indexOf(handler), 1);
			} else {
				listeners[type] = [];
			}
			return this;
		}
	};
})();

export default ChatMediator;
