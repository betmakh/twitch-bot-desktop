import React from 'react';
import ReactDOM from 'react-dom';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Sound from 'react-sound';
import IconButton from 'material-ui/IconButton';
import { MenuItem } from 'material-ui/Menu';
import Tooltip from 'material-ui/Tooltip';

// icons
import PlayIcon from 'material-ui-icons/PlayCircleOutline';
import VolumeOffIcon from 'material-ui-icons/VolumeOff';
import VolumeUpIcon from 'material-ui-icons/VolumeUp';

import { API, BOT } from '../utils/ChatUtils.js';
import { CHAT_COMPONENT } from '../utils/constants.js';

export const styles = theme => ({
	card: {
		padding: '0.1em 1.5em',
		margin: '0.5em',
		position: 'relative'
	},
	playButton: {
		position: 'absolute',
		top: 0,
		right: 0
	},
	chatContainer: {
		display: 'flex',
		flex: 1
	},
	header: {
		position: 'fixed'
	},
	chatBody: {
		paddingTop: '5.5em'
	},
	headerSelect: {
		color: theme.palette.text.primary
	}
});

class ChatComponent extends React.Component {
	static COMPONENT_NAME = CHAT_COMPONENT;
	constructor(props) {
		super(props);
		this.messageReceived.bind(this);

		this.state = {
			audioQueue: [],
			messages: [],
			channels: [],
			currentChannel: ''
		};
	}

	onFinishPlayingCallback() {
		var queue = this.state.audioQueue,
			playedMsg = queue.shift();

		this.setState({ audioQueue: queue });
	}

	// queue audio message to TTS
	queueMsg(msg, isAutoplay = false) {
		if (!msg.audioSrc) return;

		var { audioQueue } = this.state;
		audioQueue.push({
			...msg,
			isAutoplay
		});

		this.setState({ audioQueue });
	}

	toggleAutoplay() {
		var { messages } = this.state,
			{ commentsAutoplay } = this.props;

		// clear TTS queue
		if (messages.length) {
			this.setState({
				audioQueue: []
			});
		}
		this.props.saveSettings({ commentsAutoplay: !commentsAutoplay });
	}

	messageReceived(msg) {
		var { messages, audioQueue } = this.state,
			{ commentsAutoplay, maxMessages, TwitchClient } = this.props,
			self = this;

		var addMsg = msg => {
			messages.push(msg);
			if (commentsAutoplay) {
				audioQueue.push(msg);
			}
			if (messages.length > maxMessages) {
				messages.shift();
			}
			self.setState({
				messages: messages,
				audioQueue
			});
		};

		if (commentsAutoplay) {
			API.GetMessageAudio(msg.text)
				.then(url => {
					msg.audioSrc = url;
					addMsg(msg);
				})
				.catch(err => {
					self.setState({
						errorMessage: err.message
					});
					addMsg(msg);
				});
		} else {
			addMsg(msg);
		}
		if (!msg.byOwn) {
			BOT(TwitchClient, msg.text);
		}
	}

	componentWillUnmount() {
		var { TwitchClient } = this.props;
		if (TwitchClient) {
			TwitchClient.disconnect();
		}
	}
	componentWillMount() {
		const self = this,
			{ TwitchClient, currentChannel } = this.props;

		if (TwitchClient) {
			TwitchClient.connect();

			TwitchClient.on('chat', (channel, userstate, message, byOwn) => {
				self.messageReceived({
					user: userstate,
					text: message,
					id: Date.now(),
					byOwn
				});
			});
		}
	}
	componentWillReceiveProps(nextProps) {
		const self = this,
			{ TwitchClient, currentChannel } = nextProps;

		if (TwitchClient !== this.props.TwitchClient) {
			TwitchClient.connect();

			TwitchClient.on('chat', (channel, userstate, message, byOwn) => {
				console.log('message', message);
				// if (currentChannel === channel.substring(1)) {
				self.messageReceived({
					user: userstate,
					text: message,
					id: Date.now(),
					byOwn
				});
				// }
			});
			// });
		}
	}

	scrollToBottom(node) {
		if (node) {
			node = ReactDOM.findDOMNode(node);
			node.scrollIntoView({ behavior: 'smooth' });
		}
	}

	render() {
		const { classes, drawerWidth, commentsAutoplay, channels, currentChannel, saveSettings, channelData } = this.props;
		const { audioQueue, messages } = this.state;

		return (
			<div style={{ marginLeft: drawerWidth }} className={classes.chatContainer}>
				{/*play queued messages*/}
				{audioQueue.length ? (
					<Sound
						url={audioQueue[0].audioSrc}
						playStatus={Sound.status.PLAYING}
						onFinishedPlaying={this.onFinishPlayingCallback.bind(this)}
					/>
				) : null}
				<AppBar position="static" color="primary" className={classes.header}>
					<Toolbar>
						<Typography type="title" color="inherit">
							{channelData ? channelData.status : 'Connecting...'}
						</Typography>

						<IconButton onClick={this.toggleAutoplay.bind(this)}>
							{!commentsAutoplay ? (
								<Tooltip title="Unmute" placement="right">
									<VolumeOffIcon />
								</Tooltip>
							) : (
								<Tooltip title="Mute" placement="right">
									<VolumeUpIcon />
								</Tooltip>
							)}
						</IconButton>
					</Toolbar>
				</AppBar>
				<Grid container spacing={0} className={classes.chatBody} ref>
					{messages.length ? (
						messages.map((msg, index) => (
							<Grid item xs={12} key={msg.id} ref={index === messages.length - 1 ? this.scrollToBottom : null}>
								<Paper className={classes.card}>
									<Typography type="title" gutterBottom>
										{msg.user.username}
									</Typography>
									<Typography gutterBottom>{msg.text}</Typography>
									{msg.audioSrc ? (
										<IconButton className={classes.playButton} onClick={this.queueMsg.bind(this, msg, false)}>
											<PlayIcon />
										</IconButton>
									) : null}
								</Paper>
							</Grid>
						))
					) : (
						<Typography gutterBottom align="center" className={classes.card}>
							No messages
						</Typography>
					)}
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(ChatComponent);
