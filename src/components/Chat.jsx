import React from 'react';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Sound from 'react-sound';
import IconButton from 'material-ui/IconButton';
import { MenuItem } from 'material-ui/Menu';
import Select from 'material-ui/Select';

// icons
import PlayIcon from 'material-ui-icons/PlayCircleOutline';
import VolumeOffIcon from 'material-ui-icons/VolumeOff';
import VolumeUpIcon from 'material-ui-icons/VolumeUp';

import { SoundStatus, GetMessageAudio } from '../utils/ChatUtils.js';
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
			lastAutoPlayedMsgID: null,
			messages: [],
			channels: [],
			currentChannel: ''
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
			{ commentsAutoplay } = this.props;

		// clear TTS queue
		if (messages.length) {
			this.setState({
				lastAutoPlayedMsgID: messages[messages.length - 1].id,
				audioQueue: []
			});
		}
		this.props.saveSettings({ commentsAutoplay: !commentsAutoplay });
	}

	messageReceived(msg) {
		var { messages, audioQueue } = this.state,
			{ commentsAutoplay, maxMessages } = this.props,
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
			{ TwitchClient, currentChannel } = this.props;

		// this.setState({channels})

		// TwitchClient.on('connected', function(address, port) {
		// 	self.setState({ channels: TwitchClient.getOptions().channels });
		// });

		TwitchClient.on('chat', (channel, userstate, message, byOwn) => {
			console.log('currentChannel', currentChannel);
			console.log('channel', channel);
			if (currentChannel === channel.substring(1)) {
				self.messageReceived({
					user: userstate,
					text: message,
					id: Date.now(),
					byOwn
				});
			}
		});
	}

	render() {
		const { classes, drawerWidth, commentsAutoplay, channels, currentChannel, saveSettings } = this.props;
		const { audioQueue, messages } = this.state;

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
				<AppBar position="static" color="accent" className={classes.header}>
					<Toolbar>
						{/*						<Typography type="title" color="inherit">
							{channels.join(',')}
						</Typography>*/}
						<Select
							autoWidth={true}
							value={currentChannel}
							onChange={event => saveSettings({ currentChannel: event.target.value })}
						>
							{channels.map(channel => (
								<MenuItem key={channel} value={channel}>
									{channel}
								</MenuItem>
							))}
						</Select>
						<IconButton onClick={this.toggleAutoplay.bind(this)}>
							{!commentsAutoplay ? (
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
