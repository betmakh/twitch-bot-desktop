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
import UrlUtils from 'url';
import querystring from 'querystring';

import { SETTINGS_COMPONENT, AUTH_URL, TOKEN } from '../utils/constants.js';
import { styles } from './Chat.jsx';
import { API } from '../utils/ChatUtils.js';

const stylesLocal = theme =>
	Object.assign(styles(theme), {
		spacingBlock: {
			padding: `0 ${theme.spacing.unit}px`
		},
		hidden: {
			display: 'none'
		}
	});

class SettingsComponent extends React.Component {
	static COMPONENT_NAME = SETTINGS_COMPONENT;

	state = {
		channels: [],
		showLoginPage: false,
		channelData: null,
		loginUrl: 'https://twitchapps.com/tmi/'
	};

	addChannel(event) {
		var { channels } = this.state,
			ChannelNameValue = this.ChannelNameField.value;
		if (ChannelNameValue.length && !~channels.indexOf(ChannelNameValue.toLowerCase())) {
			channels.push(ChannelNameValue.toLowerCase());
			this.ChannelNameField.value = '';
			this.setState({ channels });
		}
	}

	login(event) {
		this.setState({ showLoginPage: !this.state.showLoginPage });
	}

	fetchChannelData(TwitchClient) {
		if (!TwitchClient) return;
		var self = this,
			user = TwitchClient.getUsername();
		API.getChannelInfo(user).then(resp => {
			self.setState({ channelData: resp });
		});
	}

	componentDidMount() {
		const { channels, commentsAutoplay, TwitchClient } = this.props;
		var self = this;
		this.setState({ channels, commentsAutoplay });
		// API.getUserInfo(this.props.PASS).then(resp => {
		// 	console.log('resp', resp);
		// });
		this.fetchChannelData(TwitchClient);
		this.webview.addEventListener('did-navigate', e => {
			var url = UrlUtils.parse(e.url),
				authKey = querystring.parse(url.hash)['#access_token'];

			if (authKey) {
				self.setState({ showLoginPage: false });
				self.props.saveSettings({ PASS: 'oauth:' + authKey });
			}
		});
	}

	componentWillReceiveProps(nextProps) {
		const { channels, commentsAutoplay, TwitchClient } = nextProps;
		this.setState({ channels, commentsAutoplay });
		this.fetchChannelData(TwitchClient);
	}

	removeChannel(event) {
		var channelToRemove = event.currentTarget.getAttribute('aria-label'),
			{ channels } = this.state;
		channels = channels.filter(channelName => channelName !== channelToRemove);
		this.setState({ channels });
	}

	render() {
		const { drawerWidth, classes, saveSettings } = this.props,
			{ channels, commentsAutoplay, showLoginPage, channelData, loginUrl } = this.state;

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
							<Grid container>
								<Grid md={6} xs={12} item lg={4}>
									<Typography type="headline" gutterBottom>
										Channels list
									</Typography>
									<Grid container alignItems="baseline">
										<Grid item xs={12} sm={10} className={classes.spacingBlock}>
											<TextField
												id="channelNameField"
												placeholder="Channel name"
												className={classes.textField}
												inputRef={ref => (this.ChannelNameField = ref)}
												margin="normal"
												fullWidth
											/>
										</Grid>

										<Grid item xs={12} sm={2} className={classes.spacingBlock}>
											<Button style={{ width: '100%' }} onClick={this.addChannel.bind(this)}>
												Add
											</Button>
										</Grid>
									</Grid>
									<List dense>
										{channels.map(channelName => (
											<ListItem key={channelName} button>
												<ListItemText primary={channelName} />
												<ListItemSecondaryAction>
													<IconButton aria-label={channelName} onClick={this.removeChannel.bind(this)}>
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
												onChange={event => this.setState({ commentsAutoplay: event.target.checked })}
											/>
										}
										label="Translate text to speach"
									/>
								</Grid>
								<Grid md={6} xs={12} item lg={4}>
									{channelData &&
										!showLoginPage && (
											<div>
												<Typography align="center" type="title" gutterBottom>
													<img src={channelData.logo} style={{ maxWidth: '100%' }} alt="" />
													<br />
													{channelData.display_name}
												</Typography>
											</div>
										)}
									{!showLoginPage && (
										<Button color="primary" onClick={this.login.bind(this)}>
											{channelData ? 'Change login' : 'Login'}
										</Button>
									)}
								</Grid>
								<Grid item xs={12}>
									{showLoginPage && (
										<Button color="primary" onClick={this.login.bind(this)}>
											Back
										</Button>
									)}

									<webview
										className={!showLoginPage ? classes.hidden : ''}
										ref={el => (this.webview = el)}
										src={loginUrl}
										style={{ height: '500px' }}
									/>
								</Grid>
							</Grid>
						</Paper>
						<br />
						<Paper>
							<Grid item xs={12}>
								<webview
									className={!showLoginPage ? classes.hidden : ''}
									ref={el => (this.webview = el)}
									src={loginUrl}
									style={{ height: '500px' }}
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
