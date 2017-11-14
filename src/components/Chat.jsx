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

import {SoundStatus} from '../utils/ChatUtils.js';


// icons
import PlayIcon from 'material-ui-icons/PlayCircleOutline';
import VolumeOffIcon from 'material-ui-icons/VolumeOff';
import VolumeUpIcon from 'material-ui-icons/VolumeUp';

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


// style={{marginLeft: drawerWidth}} className={classes.chatContainer}

class ChatComponent extends React.Component {

	constructor(props) {
		super(props);
		var queue = props.messages.map(msg => ({
				src: msg.audioSrc
			}))

		this.state = {
			autoplay: true,
			audioQueue: queue,
			lastAutoPlayedMsgID : null
		};
	}
	
	onFinishPlayingCallback() {
		var queue = this.state.audioQueue,
			playedMsg = queue.shift();

		if (playedMsg.isAutoplay) {
			this.setState({audioQueue: queue,lastAutoPlayedMsgID:playedMsg.id })
		} else {
			this.setState({audioQueue: queue})
		}
		
	}

	// queue audio message to TTS
	queueMsg(msg, isAutoplay = false) {
		console.log("isAutoplay", isAutoplay);
		var {audioQueue} = this.state;
		audioQueue.push({
			src: msg.audioSrc,
			id: msg.id,
			isAutoplay
		})

		this.setState({audioQueue})
	}

	// detect new messages to autoplay
	componentWillReceiveProps(nextProps) {
 		var currentMessages = this.props.messages,
 			newMessages = _.clone(nextProps.messages),
 			{autoplay, lastAutoPlayedMsgID, audioQueue} = this.state,
 			lastMsg = newMessages.pop();

 		if (autoplay) {
 			if (audioQueue.length) lastAutoPlayedMsgID = audioQueue[audioQueue.length - 1].id;
 			while (lastMsg && lastMsg.id !== lastAutoPlayedMsgID) {
 			    console.log("lastAutoPlayedMsgID", lastAutoPlayedMsgID);
 				this.queueMsg(lastMsg, true);
 				lastMsg = newMessages.pop(); 
 			}
 		}

	}

	toggleAutoplay() {
		var {autoplay} = this.state,
			{messages} = this.props,
			resultState = {autoplay : !autoplay};

		if (!autoplay && messages.length) {
			resultState.lastAutoPlayedMsgID = messages[messages.length - 1 ].id;
		}

		this.setState(resultState)
	}

	render() {
		const { messages, classes, drawerWidth, channels } = this.props;
		const {audioQueue} = this.state;
		console.log("audioQueue", audioQueue);

		return (
			<div style={{marginLeft: drawerWidth}} className={classes.chatContainer}>
				{/*play queued messages*/}
				{audioQueue.length ? (<Sound url={audioQueue[0].src}  playStatus={SoundStatus.PLAYING} onFinishedPlaying={this.onFinishPlayingCallback.bind(this)}/>) : null}
				<AppBar position="static" color="primary" className={classes.header}>
			        <Toolbar>
			          <Typography type="title" color="inherit">
			            {channels.join(',')}
			          </Typography>
  				      	<IconButton onClick={this.toggleAutoplay.bind(this)}>
				        	{!this.state.autoplay ? <VolumeOffIcon title="turn off sound"/> : <VolumeUpIcon title="turn on sound"/> }
				      	</IconButton>
			        </Toolbar>
		      	</AppBar>
		      	<Grid container spacing={0}  className={classes.chatBody}>

				{messages.length ? messages.map(msg => (
		      	<Grid item xs={12} key={msg.id}>
					<Paper className={classes.card}>
						<Typography type="title" gutterBottom>
							{msg.user.username}
						</Typography>
						<Typography gutterBottom>
							{msg.text}
						</Typography>
				      	<IconButton className={classes.playButton} onClick={this.queueMsg.bind(this,msg, false)}>
				        	<PlayIcon />
				      	</IconButton>
					</Paper>
				</Grid>
				)) : (<Typography gutterBottom >No messages</Typography>)}
		      	</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(ChatComponent);
