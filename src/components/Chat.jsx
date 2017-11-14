import React from 'react';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Sound from 'react-sound';
import IconButton from 'material-ui/IconButton';
import _ from 'lodash';

// icons
import PlayIcon from 'material-ui-icons/PlayCircleOutline';
import VolumeOffIcon from 'material-ui-icons/VolumeOff';
import VolumeUpIcon from 'material-ui-icons/VolumeUp';

import { SoundStatus, GetMessageAudio } from '../utils/ChatUtils.js';
import { CHAT_COMPONENT } from '../utils/constants.js';

const styles = theme => ({
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
		paddingTop: '4.5em'
	}
});

class ChatComponent extends React.Component {
	static COMPONENT_NAME = CHAT_COMPONENT;
	constructor(props) {
		super(props);
		console.log('propscoNS', props);
		this.messageReceived.bind(this);

		var queue = props.messages.map(msg => ({
			src: msg.audioSrc
		}));

		props.TwitchClient.connect();

		this.state = {
			audioQueue: queue,
			lastAutoPlayedMsgID: null,
			messages: [],
			channels: ['Connecting...']
		};
	}

	onFinishPlayingCallback() {
		var queue = this.state.audioQueue,
			playedMsg = queue.shift();

		if (playedMsg.isAutoplay) {
			this.setState({ audioQueue: queue, lastAutoPlayedMsgID: playedMsg.id });
		} else {
			this.setState({ audioQueue: queue });
		}
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
			{ messageAutoplay } = this.props;

		// clear TTS queue
		if (messages.length) {
			this.setState({
				lastAutoPlayedMsgID: messages[messages.length - 1].id,
				audioQueue: []
			});
		}
		this.props.handleToggleAutoplay();
	}

	messageReceived(msg) {
		var { messages, audioQueue } = this.state,
			{ messageAutoplay, maxMessages } = this.props,
			self = this;

		var addMsg = msg => {
			messages.push(msg);
			if (messageAutoplay) {
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

		if (messageAutoplay) {
			GetMessageAudio(msg.text)
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
	}

	componentWillMount() {
		const self = this,
			{ TwitchClient } = this.props;

		TwitchClient.on('connected', function(address, port) {
			self.setState({ channels: TwitchClient.getOptions().channels });
		});

		TwitchClient.on('chat', (channel, userstate, message, byOwn) => {
			self.messageReceived({
				user: userstate,
				text: message,
				id: Date.now(),
				byOwn
			});
		});
	}

	render() {
		const { classes, drawerWidth, messageAutoplay } = this.props;
		const { audioQueue, channels, messages } = this.state;

		return (
			<div style={{ marginLeft: drawerWidth }} className={classes.chatContainer}>
				{/*play queued messages*/}
				{audioQueue.length ? (
					<Sound
						url={audioQueue[0].audioSrc}
						playStatus={SoundStatus.PLAYING}
						onFinishedPlaying={this.onFinishPlayingCallback.bind(this)}
					/>
				) : null}
				<AppBar position="static" color="primary" className={classes.header}>
					<Toolbar>
						<Typography type="title" color="inherit">
							{channels.join(',')}
						</Typography>
						<IconButton onClick={this.toggleAutoplay.bind(this)}>
							{!messageAutoplay ? (
								<VolumeOffIcon title="turn off sound" />
							) : (
								<VolumeUpIcon title="turn on sound" />
							)}
						</IconButton>
					</Toolbar>
				</AppBar>
				<Grid container spacing={0} className={classes.chatBody}>
					{messages.length ? (
						messages.map(msg => (
							<Grid item xs={12} key={msg.id}>
								<Paper className={classes.card}>
									<Typography type="title" gutterBottom>
										{msg.user.username}
									</Typography>
									<Typography gutterBottom>{msg.text}</Typography>
									{msg.audioSrc ? (
										<IconButton
											className={classes.playButton}
											onClick={this.queueMsg.bind(this, msg, false)}
										>
											<PlayIcon />
										</IconButton>
									) : null}
								</Paper>
							</Grid>
						))
					) : (
						<Typography gutterBottom>No messages</Typography>
					)}
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(ChatComponent);
