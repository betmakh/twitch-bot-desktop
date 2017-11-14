import Grid from 'material-ui/Grid';
import React from 'react';

import MainMenu from './MainMenu.jsx';
import TwitchClient from '../utils/main';
import ChatComponent from './Chat.jsx';
import {GetMessageAudio} from '../utils/ChatUtils.js';
import Slide from 'material-ui/transitions/Slide';
import Snackbar from 'material-ui/Snackbar';


const drawerWidth = 240;

class MainAppContainer extends React.Component {
	state = {
		connected: true,
		messages: [],
		maxMessages: 50,
		drawerWidth,
		channels: [],
		errorMessage: '',
		messageAutoplay: true
	};

	messageReceived(msg) {
		var messages = this.state.messages,
			maxMessages = this.state.maxMessages,
			self = this;

		var addMsg = msg => {
			messages.push(msg);
			while (messages.length > maxMessages) {
				messages.shift();
			}
			self.setState({
				messages: messages
			});
		}

		if (self.state.messageAutoplay) {
			GetMessageAudio(msg.text).then(url => {
				msg.audioSrc = url;
				addMsg(msg);
			}).catch(err => {
				self.setState({
					errorMessage: err.message
				})
				addMsg(msg);

			})
		} else {
			addMsg(msg);
		}


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
	
	handleToggleAutoplay() {
		this.setState({messageAutoplay : !this.state.messageAutoplay});
	}

	constructor(props) {
		super(props);
		this.messageReceived.bind(this);

	
	}
	render() {
		const {errorMessage} = this.state;
		return (
			<Grid container>
					<MainMenu drawerWidth={this.state.drawerWidth}/>
					<ChatComponent {...this.state} handleToggleAutoplay={this.handleToggleAutoplay.bind(this)}/>

					<Snackbar
			          open={errorMessage && errorMessage.length ? true : false}
			          transition={props => (<Slide direction="up" {...props} />)}
			          SnackbarContentProps={{
			            'aria-describedby': 'message-id',
			          }}
			          message={<span id="message-id">{errorMessage}</span>}
			        />
			</Grid>
		);
	}
}

export default MainAppContainer;
