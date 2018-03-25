import tmi from 'tmi.js';

import bot from './bot';

class TwitchClient extends tmi.client {
	constructor(opts) {
		super(
			Object.assign(
				{
					options: {
						debug: true
					},
					connection: {
						reconnect: true
					},
					identity: {
						username: 'null'
					}
				},
				opts
			)
		);
	}
	connect() {
		console.log('connection');
		var state = this.readyState(),
			self = this;
		if (state === 'CLOSING' || state === 'CLOSED') {
			return super.connect().then(() => Promise.resolve(self), err => Promise.reject(err));
		} else if (state === 'CONNECTING' || state === 'OPEN') {
			return Promise.resolve(self);
		}
	}
	updatePass(pass) {
		var self = this,
			state = this.readyState();
		if (state !== 'CLOSING' && state !== 'CLOSED') {
			return this.disconnect().then(() => {
				self.opts.identity.PASS = pass;
				return Promise.resolve(self);
			});
		} else {
			self.opts.identity.PASS = pass;
			return Promise.resolve(self);
		}
	}
	chageChannel(newChannel) {
		var channels = this.getChannels(),
			self = this;
		if (channels.length) {
			channels.forEach(channel => {
				self.leave(channel);
			});
		}
		return self.join(newChannel).then(() => self);
	}
	_handleBotMessage(channel, userstate, message, byOwn) {
		bot.handleMessage(message, userstate, this._botCommands, this);
	}
	enableBot(enable = false, commands) {
		this._botCommands = commands;
		if (enable && this._botEnabled !== enable) {
			this._botEnabled = true;
			this.addListener('chat', this._handleBotMessage);
		} else if (this._botEnabled) {
			this._botEnabled = false;
			this.removeListener('chat', this._handleBotMessage);
		}
		return this;
	}
}

export default TwitchClient;
