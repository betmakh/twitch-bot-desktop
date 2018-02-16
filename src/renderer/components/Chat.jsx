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
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';

// iconsPcom
import PlayIcon from 'material-ui-icons/PlayCircleOutline';
import VolumeOffIcon from 'material-ui-icons/VolumeOff';
import VolumeUpIcon from 'material-ui-icons/VolumeUp';
import SendIcon from 'material-ui-icons/Send';

import { API } from '../utils/chatUtils.js';
import BOT from '../utils/bot.js';
import { CHAT_COMPONENT } from '../utils/constants.js';

export const styles = theme => ({
	card: {
		padding: '0.1em 1.5em',
		margin: '0.5em',
		position: 'relative'
	},
	spacingBlock: {
		paddingRight: theme.spacing.unit,
		paddingLeft: theme.spacing.unit
	},
	playButton: {
		position: 'fixed',
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
	},
	bottomContainerWrapper: {
		position: 'relative',
		minHeight: '100vh',
		width: '100%',
		marginBottom: '-8px'
	},
	bottomContainer: {
		borderTop: `1px solid ${theme.palette.divider}`,
		position: 'absolute',
		padding: theme.spacing.unit,
		bottom: 0,
		left: 0,
		height: theme.spacing.unit * 15
	}
});

class ChatComponent extends React.Component {
	static COMPONENT_NAME = CHAT_COMPONENT;
	constructor(props) {
		super(props);
		this.messageReceived = this.messageReceived.bind(this);

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

	messageReceived(channel, userstate, message, byOwn) {
		var { messages, audioQueue } = this.state,
			{ commentsAutoplay, maxMessages, twitchClient, botEnabled } = this.props,
			self = this,
			msg = {
				user: userstate,
				text: message,
				id: Date.now(),
				byOwn
			};

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

		if (commentsAutoplay && !msg.byOwn) {
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
	}

	addChatListener(props = this.props) {
		const { twitchClient, commands, botEnabled } = props,
			self = this;

		twitchClient && twitchClient.addListener('chat', self.messageReceived);
	}

	componentWillMount() {
		this.setState({
			messages: this.props.messages
		});
		this.addChatListener();
	}

	componentWillUnmount() {
		var { twitchClient } = this.props;
		this.props.updateMessages(this.state.messages);
		twitchClient && twitchClient.removeListener('chat', this.messageReceived);
	}
	componentWillReceiveProps(nextProps) {
		const { twitchClient } = nextProps;

		if (twitchClient && !this.props.twitchClient) {
			this.addChatListener(nextProps);
		}
	}
	sendMessage() {
		var msg = this.MessageField.value;
		if (msg && msg.trim().length) {
			API.sendMsg(this.props.twitchClient, msg);
			this.MessageField.value = '';
		}
	}

	scrollToBottom(node) {
		if (node) {
			node = ReactDOM.findDOMNode(node);
			node.scrollIntoView({ behavior: 'smooth' });
		}
	}

	render() {
		const {
			classes,
			drawerWidth,
			commentsAutoplay,
			channels,
			currentChannel,
			saveSettings,
			channelData
		} = this.props;
		const { audioQueue, messages } = this.state;

		return (
			<div className={classes.bottomContainerWrapper} style={{ marginLeft: drawerWidth }}>
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
						<IconButton onClick={this.toggleAutoplay.bind(this)}>
							{!commentsAutoplay ? <VolumeOffIcon title="Unmute" /> : <VolumeUpIcon title="Mute" />}
						</IconButton>
						<Typography
							variant="title"
							title={channelData ? channelData.status : 'Connecting...'}
							color="inherit"
						>
							{channelData ? channelData.status : 'Connecting...'}
						</Typography>
					</Toolbar>
				</AppBar>
				<Grid container spacing={0} className={`${classes.chatContainer}`} style={{ paddingBottom: '120px' }}>
					<Grid container spacing={0} className={`${classes.chatBody}`}>
						{messages.length ? (
							messages.map((msg, index) => (
								<Grid
									item
									xs={12}
									key={msg.id}
									ref={index === messages.length - 1 ? this.scrollToBottom : null}
								>
									<Paper className={classes.card}>
										<Typography variant="title" gutterBottom>
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
				</Grid>
				<Grid container spacing={0} className={`${classes.bottomContainer}`}>
					<Grid item sm={9} lg={10} xl={11}>
						<div className={classes.spacingBlock}>
							<TextField
								label="Multiline"
								multiline
								fullWidth
								rowsMax="3"
								inputRef={ref => (this.MessageField = ref)}
								margin="normal"
							/>
						</div>
					</Grid>
					<Grid item sm={3} lg={2} xl={1}>
						<div className={classes.spacingBlock}>
							<Button
								fullWidth
								variant="raised"
								color="secondary"
								size="small"
								color="primary"
								onClick={this.sendMessage.bind(this)}
							>
								Send
								<SendIcon className={classes.spacingBlock} />
							</Button>
						</div>
					</Grid>
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(ChatComponent);
