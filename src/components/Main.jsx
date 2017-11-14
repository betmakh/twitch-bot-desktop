import Grid from 'material-ui/Grid';
import React from 'react';

import MainMenu from './MainMenu.jsx';
import TwitchClient from '../utils/main';
import ChatComponent from './Chat.jsx';
import {GetMessageAudio} from '../utils/ChatUtils.js';

const drawerWidth = 240;

class MainAppContainer extends React.Component {
	state = {
		connected: true,
		messages: [],
		maxMessages: 50,
		drawerWidth,
		channels: []
	};

	messageReceived(msg) {
		var messages = this.state.messages,
			maxMessages = this.state.maxMessages,
			audio = GetMessageAudio(msg.text),
			self = this;


		audio.then(url => {
			msg.audioSrc = url
			messages.push(msg);
			while (messages.length > maxMessages) {
				messages.shift();
			}
			self.setState({
				messages: messages
			});
		});

	}

	componentWillMount() {
	    var self = this;

	    TwitchClient.connect();
	    
	    TwitchClient.on('connected', function(address, port) {
	    	self.setState({channels:TwitchClient.getOptions().channels })
	    });

	    TwitchClient.on('chat', (channel, userstate, message, byOwn) => {
	    	var id = Date.now();

	        self.messageReceived({
	            user: userstate,
	            text: message,
	            id: Date.now(),
	            byOwn
	        });
	    });
	}

	constructor(props) {
		super(props);
		this.messageReceived.bind(this);

	
	}
	render() {
		return (
			<Grid container>
					<MainMenu drawerWidth={this.state.drawerWidth}/>
					<ChatComponent {...this.state}/>
			</Grid>
		);
	}
}

export default MainAppContainer;
