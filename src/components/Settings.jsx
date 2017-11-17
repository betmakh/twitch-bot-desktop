import { withStyles } from 'material-ui/styles';
import React from 'react';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import DeleteIcon from 'material-ui-icons/Delete';
import { FormGroup, FormControlLabel } from 'material-ui/Form';
import Checkbox from 'material-ui/Checkbox';
import List, { ListItem, ListItemAvatar, ListItemIcon, ListItemSecondaryAction, ListItemText } from 'material-ui/List';

import { SETTINGS_COMPONENT } from '../utils/constants.js';
import { styles } from './Chat.jsx';

const stylesLocal = theme =>
	Object.assign(styles(theme), {
		spacingBlock: {
			padding: `0 ${theme.spacing.unit}px`
		}
	});

class SettingsComponent extends React.Component {
	static COMPONENT_NAME = SETTINGS_COMPONENT;

	state = {
		channels: []
	};

	// constructor(props) {
	// 	super(props);
	// 	var { channels, commentsAutoplay } = props;
	// 	this.state = { channels, commentsAutoplay };
	// }
	addChannel(event) {
		var { channels } = this.state,
			ChannelNameValue = this.ChannelNameField.value;
		if (ChannelNameValue.length && !~channels.indexOf(ChannelNameValue.toLowerCase())) {
			channels.push(ChannelNameValue.toLowerCase());
			this.ChannelNameField.value = '';
			this.setState({ channels });
		}
	}

	removeChannel(event) {
		var channelToRemove = event.currentTarget.getAttribute('aria-label'),
			{ channels } = this.state;
		channels = channels.filter(channelName => channelName !== channelToRemove);
		this.setState({ channels });
	}

	// saveSettings() {
	// 	var { commentsAutoplay, channels } = this.state;
	// 	this.props.saveSettings({ commentsAutoplay, channels })
	// }

	render() {
		const { drawerWidth, classes, saveSettings, channels, commentsAutoplay } = this.props;

		return (
			<div style={{ marginLeft: drawerWidth }} className={classes.chatContainer}>
				<AppBar position="static" color="primary" className={classes.header}>
					<Toolbar>
						<Typography type="title" color="inherit">
							{'Settings'}
						</Typography>
					</Toolbar>
				</AppBar>
				<Grid container spacing={0} className={classes.chatBody}>
					{/*<Grid container spacing={0} alignItems={baseline}></Grid>*/}
					<Grid item xs={12} className={classes.spacingBlock}>
						<Paper className={classes.spacingBlock}>
							<Grid container alignItems="baseline">
								<Grid item xs={12} sm={12} md={10} className={classes.spacingBlock}>
									<TextField
										id="channelNameField"
										placeholder="Channel name"
										className={classes.textField}
										inputRef={ref => (this.ChannelNameField = ref)}
										margin="normal"
										fullWidth
									/>
								</Grid>

								<Grid item xs={12} sm={12} md={2} className={classes.spacingBlock}>
									<Button style={{ width: '100%' }} onClick={this.addChannel.bind(this)}>
										Add channel
									</Button>
								</Grid>
							</Grid>
							<Grid md={6} xs={12} item lg={4}>
								<List dense>
									{channels.map(channelName => (
										<ListItem key={channelName} button>
											<ListItemText primary={channelName} />
											<ListItemSecondaryAction>
												<IconButton
													aria-label={channelName}
													onClick={this.removeChannel.bind(this)}
												>
													<DeleteIcon />
												</IconButton>
											</ListItemSecondaryAction>
										</ListItem>
									))}
								</List>
							</Grid>
							<Grid md={6} xs={12} item lg={4}>
								<FormControlLabel
									control={
										<Checkbox
											inputRef={ref => (this.ChatAutoplay = ref)}
											checked={commentsAutoplay}
											onChange={event =>
												this.setState({ commentsAutoplay: event.target.checked })
											}
										/>
									}
									label="Translate text to speach"
								/>
							</Grid>
						</Paper>
					</Grid>
					<Grid item xs={12} className={classes.spacingBlock}>
						<br />
						<Button
							raised
							color="primary"
							onClick={event => saveSettings({ commentsAutoplay, channels })}
							style={{ width: '100%' }}
						>
							Save
						</Button>
					</Grid>
				</Grid>
			</div>
		);
	}
}

export default withStyles(stylesLocal)(SettingsComponent);
