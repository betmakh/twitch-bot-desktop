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
import Modal from 'material-ui/Modal';
import Card, { CardActions, CardContent, CardMedia } from 'material-ui/Card';
import DeleteIcon from 'material-ui-icons/Delete';
import EditIcon from 'material-ui-icons/Edit';
import { FormGroup, FormControlLabel } from 'material-ui/Form';
import Checkbox from 'material-ui/Checkbox';
import List, { ListItem, ListItemAvatar, ListItemIcon, ListItemSecondaryAction, ListItemText } from 'material-ui/List';
import UrlUtils from 'url';
import { CircularProgress } from 'material-ui/Progress';
import querystring from 'querystring';

import { SETTINGS_COMPONENT, AUTH_URL, TOKEN } from '../utils/constants.js';
import { styles } from './Chat.jsx';
import { API } from '../utils/chatUtils.js';
import BotCommandDetails from './BotCommandDetails.jsx';

const stylesLocal = theme =>
	Object.assign(styles(theme), {
		spacingBlock: {
			paddingRight: theme.spacing.unit,
			paddingLeft: theme.spacing.unit
		},
		hidden: {
			display: 'none'
		},
		media: {
			height: 200
		},
		textCenter: {
			textAlign: 'center'
		},
		modal: {
			position: 'absolute',
			width: 8 * 50,
			top: `50%`,
			left: `50%`,
			transform: `translate(-50%, -50%)`,
			border: '1px solid #e5e5e5',
			backgroundColor: '#fff',
			boxShadow: '0 5px 15px rgba(0, 0, 0, .5)',
			padding: 8 * 4
		}
	});

class SettingsComponent extends React.Component {
	static COMPONENT_NAME = SETTINGS_COMPONENT;

	state = {
		showLoginPage: false,
		userData: null,
		loginUrl: AUTH_URL,
		commandPopUp: {
			open: false,
			command: {}
		}
	};

	addChannel(event) {
		var { channels, saveSettings } = this.props,
			ChannelNameValue = this.ChannelNameField.value;
		if (ChannelNameValue.length && !~channels.indexOf(ChannelNameValue.toLowerCase())) {
			channels.push(ChannelNameValue.toLowerCase());
			this.ChannelNameField.value = '';
			saveSettings({ channels });
		}
	}

	login(event) {
		var { showLoginPage, loginUrl } = this.state,
			{ PASS } = this.props,
			self = this;

		if (!showLoginPage) {
			fetch(AUTH_URL).then(resp => {
				this.setState({
					loginUrl: resp.url,
					showLoginPage: true
				});
			});
		} else {
			this.setState({ showLoginPage: !showLoginPage });
		}
	}

	logout() {
		this.props.saveSettings({ PASS: null });
	}

	fetchuserData(token) {
		if (!token) {
			this.setState({ userData: null });
		} else {
			var self = this;

			this.setState({
				userDataLoading: true
			});
			API.getUserInfo(token)
				.then(resp => {
					if (resp.data[0]) {
						self.setState({ userData: resp.data[0], userDataLoading: false });
					}
				})
				.catch(err => {
					self.props.showNotification("Can't receive account data");
					self.setState({ userDataLoading: false });
				});
		}
	}

	componentDidMount() {
		const { PASS } = this.props;
		this.fetchuserData(PASS);
	}

	webViewListener(webView) {
		var self = this;
		if (!webView) return;

		webView.addEventListener('did-get-redirect-request', e => {
			var url = UrlUtils.parse(e.newURL),
				hash = url.hash && url.hash.substr(1),
				urlParams = hash && querystring.parse(hash),
				error = urlParams && urlParams['error_description'],
				authKey = urlParams && urlParams['access_token'];

			if (authKey) {
				self.setState({ showLoginPage: false });
				self.props.saveSettings({ PASS: authKey });
			} else if (error) {
				self.setState({ showLoginPage: false });
				self.props.showNotification(error);
			}
		});
	}

	componentWillReceiveProps(nextProps) {
		const { channels, commentsAutoplay, PASS } = nextProps;
		this.setState({ channels, commentsAutoplay });
		if (this.props.PASS !== PASS) {
			this.fetchuserData(PASS);
		}
	}

	removeChannel(event) {
		var channelToRemove = event.currentTarget.getAttribute('aria-label'),
			{ channels } = this.props;
		channels = channels.filter(channelName => channelName !== channelToRemove);
		this.props.saveSettings({ channels });
	}

	removeCommand(command) {
		var { commands } = this.props;
		commands.splice(commands.indexOf(command), 1);
		this.props.saveSettings({ commands });
	}

	closePopup(command) {
		var { commandPopUp } = this.state,
			{ commands } = this.props;

		if (command) {
			let index = null,
				iterator = commands.length - 1;
			while (iterator >= 0 && !index) {
				if (commands[iterator].command === command.command) {
					index = iterator;
				}
				iterator--;
			}

			if (index !== null) {
				commands[index] = command;
			} else {
				commands.push(command);
			}
			this.props.saveSettings({ commands });
		}
		commandPopUp.open = false;
		this.setState({ commandPopUp });
	}

	openPopup(command) {
		var { commandPopUp } = this.state;
		commandPopUp.open = true;
		commandPopUp.command = command || {};
		this.setState({ commandPopUp });
	}

	render() {
		const {
				channels,
				drawerWidth,
				classes,
				botEnabled,
				saveSettings,
				followersNotification,
				commentsAutoplay,
				watchersNotification,
				commands
			} = this.props,
			{ showLoginPage, userData, loginUrl, userDataLoading, commandPopUp } = this.state;

		return (
			<div style={{ marginLeft: drawerWidth }} className={classes.chatContainer}>
				<Modal open={commandPopUp.open} onClose={this.closePopup.bind(this, null)}>
					<div className={classes.modal}>
						<BotCommandDetails command={commandPopUp.command} actionHandler={this.closePopup.bind(this)} />
					</div>
				</Modal>
				<AppBar position="static" color="primary" className={classes.header}>
					<Toolbar>
						<Typography type="title" color="inherit">
							{'Settings'}
						</Typography>
					</Toolbar>
				</AppBar>
				<div className={classes.chatBody + ' ' + classes.spacingBlock} style={{ width: '100%' }}>
					<Grid container>
						<Grid md={6} xs={12} item lg={4}>
							{userDataLoading ? (
								<div className={classes.textCenter}>
									<CircularProgress size={100} color="accent" />
								</div>
							) : (
								<Card>
									{userData && (
										<CardMedia
											className={classes.media}
											image={userData.profile_image_url}
											title={userData.display_name}
										/>
									)}
									<CardContent>
										{userData && (
											<Typography type="headline" component="h2">
												{userData.display_name}
											</Typography>
										)}
										<Typography component="p">
											Your bot is going to send messages from this account
										</Typography>
									</CardContent>
									<CardActions>
										<Button color="primary" onClick={this.login.bind(this)}>
											{userData ? 'Change login' : 'Login'}
										</Button>
										{userData ? <Button onClick={this.logout.bind(this)}>Logout</Button> : null}
									</CardActions>
								</Card>
							)}
						</Grid>
						<Grid md={6} xs={12} item lg={4}>
							<Card>
								<CardContent>
									<Typography type="headline" gutterBottom>
										Channels list
									</Typography>
									<Grid container alignItems="baseline">
										<Grid item xs={12} sm={8} className={classes.spacingBlock}>
											<TextField
												id="channelNameField"
												placeholder="Channel name"
												className={classes.textField}
												inputRef={ref => (this.ChannelNameField = ref)}
												margin="normal"
												fullWidth
											/>
										</Grid>

										<Grid item xs={12} sm={4} className={classes.spacingBlock}>
											<Button
												style={{ width: '100%' }}
												color="primary"
												onClick={this.addChannel.bind(this)}
											>
												Add
											</Button>
										</Grid>
									</Grid>
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
								</CardContent>
							</Card>
						</Grid>
						<Grid md={6} xs={12} item lg={4}>
							<Card>
								<CardContent>
									<Typography type="headline" gutterBottom>
										Chat settings
									</Typography>
									<FormControlLabel
										control={
											<Checkbox
												checked={commentsAutoplay}
												onChange={event =>
													saveSettings({ commentsAutoplay: event.target.checked })
												}
											/>
										}
										label="Translate text to speach"
									/>
									<FormControlLabel
										control={
											<Checkbox
												checked={followersNotification}
												onChange={event =>
													saveSettings({ followersNotification: event.target.checked })
												}
											/>
										}
										label="Show new followers notifiations"
									/>
									<FormControlLabel
										control={
											<Checkbox
												checked={botEnabled}
												onChange={event => saveSettings({ botEnabled: event.target.checked })}
											/>
										}
										label="Enable bot commands"
									/>
									<FormControlLabel
										control={
											<Checkbox
												checked={watchersNotification}
												onChange={event =>
													saveSettings({ watchersNotification: event.target.checked })
												}
											/>
										}
										label="Enable new watchers notification"
									/>
								</CardContent>
							</Card>
						</Grid>
						{botEnabled && (
							<Grid xs={12} item>
								<Card>
									<CardContent>
										<Typography type="headline" gutterBottom>
											Bot commands
										</Typography>
										<List dense>
											{commands &&
												commands.map(command => (
													<ListItem key={command.command} button>
														<ListItemText
															primary={command.command}
															secondary={`${command.type}: ${command.text}`}
														/>
														<ListItemSecondaryAction>
															<IconButton
																title="Delete command"
																onClick={e => this.removeCommand(command)}
															>
																<DeleteIcon />
															</IconButton>
															<IconButton
																title="Edit command"
																onClick={e => this.openPopup(command)}
															>
																<EditIcon />
															</IconButton>
														</ListItemSecondaryAction>
													</ListItem>
												))}
										</List>

										<Button onClick={this.openPopup.bind(this, null)}>Add command</Button>
									</CardContent>
								</Card>
							</Grid>
						)}
					</Grid>
					{showLoginPage && (
						<div>
							<webview src={loginUrl} ref={el => this.webViewListener(el)} style={{ height: '500px' }} />
						</div>
					)}
				</div>
			</div>
		);
	}
}

export default withStyles(stylesLocal)(SettingsComponent);
