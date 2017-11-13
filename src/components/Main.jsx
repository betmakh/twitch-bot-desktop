import Grid from 'material-ui/Grid';
import React from 'react';

import MainMenu from './MainMenu.jsx';
import TwitchClient from '../utils/main';
import ChatComponent from './Chat.jsx';

class MainAppContainer extends React.Component {
	state = {
		connected: true,
		messages: [],
		maxMessages: 50
	};

	messageReceived(msg) {
		var messages = this.state.messages,
			maxMessages = this.state.maxMessages;

		messages.push(msg);

		while (messages.length > maxMessages) {
			messages.shift();
		}
		this.setState({
			messages: messages
		});
	}

	constructor(props) {
		super(props);
		var self = this;
		this.messageReceived.bind(this);

		TwitchClient.connect();

		TwitchClient.on('chat', (channel, userstate, message, byOwn) => {
			self.messageReceived({
				user: userstate,
				text: message,
				id: Date.now()
			});
		});
	}
	render() {
		return (
			<Grid container>
				<Grid item xs={4}>
					<MainMenu />
				</Grid>
				<Grid item xs={8}>
					<ChatComponent messages={this.state.messages} />
				</Grid>
			</Grid>
		);
	}
}

export default MainAppContainer;
