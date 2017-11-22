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
import Card, { CardActions, CardContent, CardMedia } from 'material-ui/Card';
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
			paddingRight: theme.spacing.unit,
			paddingLeft: theme.spacing.unit
		},
		hidden: {
			display: 'none'
		},
		media: {
			height: 200
		}
	});

class SettingsComponent extends React.Component {
	static COMPONENT_NAME = SETTINGS_COMPONENT;

	state = {
		channels: [],
		showLoginPage: false,
		userData: null,
		loginUrl: AUTH_URL
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
		var { showLoginPage, loginUrl } = this.state,
			{ PASS } = this.props,
			self = this;
		if (!showLoginPage) {
			if (PASS && PASS.length) {
				self.props.saveSettings({ PASS: null });
				API.revokeUserAccess(PASS).then(resp => {
					this.setState({ showLoginPage: !showLoginPage });
				});
			} else {
				this.setState({ showLoginPage: !showLoginPage });
			}
		} else {
			this.setState({ showLoginPage: !showLoginPage });
		}
	}

	fetchuserData(token) {
		if (!token) return;
		var self = this;
		API.getUserInfo(token).then(resp => {
			if (resp.data[0]) {
				self.setState({ userData: resp.data[0] });
			}
		});
	}

	componentDidMount() {
		const { channels, commentsAutoplay, PASS } = this.props;
		var self = this;
		this.setState({ channels, commentsAutoplay });
		// API.getUserInfo(this.props.PASS).then(resp => {
		// 	console.log('resp', resp);
		// });
		this.fetchuserData(PASS);
		// this.webview.addEventListener('will-navigate', e => {
		// 	var url = UrlUtils.parse(e.url),
		// 		authKey = querystring.parse(url.hash)['#access_token'];
		// 	console.log('url', url);

		// 	if (authKey) {
		// 		self.setState({ showLoginPage: false });
		// 		self.props.saveSettings({ PASS: authKey });
		// 	}
		// });
	}

	webViewListener(webView) {
		var self = this;
		if (!webView) return;
		webView.src = this.state.loginUrl + '&state=' + Date.now();
		console.log('webView', webView.src);
		webView.addEventListener('did-navigate', e => {
			console.log('e', e);
		});
		webView.addEventListener('did-start-loading', e => {
			console.log('e', e);
		});
		webView.addEventListener('will-navigate', e => {
			var url = UrlUtils.parse(e.url),
				authKey = querystring.parse(url.hash)['#access_token'];
			console.log('url', url);

			if (authKey) {
				self.setState({ showLoginPage: false });
				self.props.saveSettings({ PASS: authKey });
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
			{ channels } = this.state;
		channels = channels.filter(channelName => channelName !== channelToRemove);
		this.setState({ channels });
	}

	render() {
		const { drawerWidth, classes, saveSettings } = this.props,
			{ channels, commentsAutoplay, showLoginPage, userData, loginUrl } = this.state;

		return (
			<div style={{ marginLeft: drawerWidth }} className={classes.chatContainer}>
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
									<Typography component="p">Your bot is going to send messages from this account</Typography>
								</CardContent>
								<CardActions>
									<Button color="primary" onClick={this.login.bind(this)}>
										{userData ? 'Change login' : 'Login'}
									</Button>
								</CardActions>
							</Card>
						</Grid>
						<Grid md={6} xs={12} item lg={4}>
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
									<Typography component="p">Your bot is going to send messages from this account</Typography>
								</CardContent>
								<CardActions>
									<Button color="primary" onClick={this.login.bind(this)}>
										{userData ? 'Change login' : 'Login'}
									</Button>
								</CardActions>
							</Card>
						</Grid>
					</Grid>
					{showLoginPage && (
						<div>
							<webview ref={el => this.webViewListener(el)} style={{ height: '500px' }} />
						</div>
					)}
				</div>
				{/*				<Grid container spacing={0} className={classes.chatBody}>
					{/*<Grid container spacing={0} alignItems={baseline}></Grid>
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
						{channelData && (
							<div>
								<Card>
									<CardMedia className={classes.media} image={channelData.logo} title={channelData.display_name} />
									<CardContent>
										<Typography type="headline" component="h2">
											{channelData.display_name}
										</Typography>
										<Typography component="p">Your bot is going to send messages from this account</Typography>
									</CardContent>
									<CardActions>
										<Button color="primary" onClick={this.login.bind(this)}>
											{channelData ? 'Change login' : 'Login'}
										</Button>
									</CardActions>
								</Card>
							</div>
						)}
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
				</Grid>*/}
			</div>
		);
	}
}

export default withStyles(stylesLocal)(SettingsComponent);
