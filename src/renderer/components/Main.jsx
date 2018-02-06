import Grid from 'material-ui/Grid';
import React from 'react';
import Snackbar from 'material-ui/Snackbar';
import Slide from 'material-ui/transitions/Slide';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import { ipcRenderer } from 'electron';
import tmi from 'tmi.js';

import MainMenu from './MainMenu.jsx';
// import TwitchClient from '../utils/main';
import ChatComponent from './Chat.jsx';
import UserListComponent from './UserList.jsx';
import SettingsComponent from './Settings.jsx';
import FollowersListComponent from './FollowersList.jsx';
import { FollowersWatcher, API } from '../utils/chatUtils.js';
import ChatMediator from '../utils/chatMediator';

class MainAppContainer extends React.Component {
	state = {
		maxMessages: 50,
		drawerWidth: 240,
		channels: [],
		notification: null,
		commentsAutoplay: true,
		currentChannel: '',
		sectionSelected: ChatComponent.COMPONENT_NAME,
		TwitchClient: null,
		FollowersWatcher,
		channelData: null,
		followersNotification: false,
		watchersNotification: false,
		commands: [],
		botEnabled: false,
		messages: []
	};
	saveSettings(settings) {
		var {
			channels,
			commentsAutoplay,
			commands,
			currentChannel,
			botEnabled,
			PASS,
			TOKEN,
			followersNotification,
			watchersNotification
		} = this.state;
		ipcRenderer.send('settings-save', {
			channels,
			commentsAutoplay,
			currentChannel,
			PASS,
			watchersNotification,
			TOKEN,
			botEnabled,
			followersNotification,
			commands,
			...settings
		});
	}

	showNotification(notification, delay = 7000) {
		var that = this,
			{ TwitchClient } = this.state;
		if (TwitchClient) {
			TwitchClient.action(this.state.currentChannel, notification);
		}
		setTimeout(() => {
			that.setState({ notification: null });
		}, delay);
		this.setState({ notification });
	}
	componentWillMount() {
		var self = this;
		// request initial settings
		ipcRenderer.send('settings-request');

		ipcRenderer.on('settings-updated', (event, data) => {
			var { currentChannel, FollowersWatcher, TwitchClient, PASS } = self.state;
			if (!data.followersNotification) {
				FollowersWatcher.stop();
			} else {
				FollowersWatcher.start(data.currentChannel, follows => {
					self.showNotification(
						'New followers: ' + follows.map(follow => follow.user.display_name).join(', ')
					);
				});
			}
			var connection = (() => {
				if (PASS !== data.PASS) {
					TwitchClient && TwitchClient.disconnect();
					TwitchClient = new tmi.client({
						options: {
							debug: true
						},
						connection: {
							reconnect: true
						},
						identity: {
							password: `oauth:${data.PASS}`,
							username: 'null'
						},
						channels: [currentChannel]
					});
					return TwitchClient.connect().then(server => Promise.resolve(TwitchClient));
				} else {
					return Promise.resolve(TwitchClient);
				}
			})();

			connection.then(TwitchClient => {
				if (TwitchClient) {
					ChatMediator.init(TwitchClient);
					TwitchClient.removeAllListeners('join');
					if (currentChannel !== data.currentChannel && data.currentChannel) {
						currentChannel && TwitchClient.leave(currentChannel);
						TwitchClient.join(data.currentChannel);
						API.getChannelInfo(data.currentChannel).then(resp => {
							self.setState({ channelData: resp });
						});
					}
					if (data.watchersNotification) {
						TwitchClient.on('join', (channel, username, byOwn) => {
							self.showNotification(`New watcher. Cheers for @${username}`);
						});
					}
				}
				self.setState({ TwitchClient });
				self.setState(data);
			});
		});

		ipcRenderer.on('error', (event, data) => {});
	}

	updateMessageList(messages) {
		this.setState({ messages });
	}

	render() {
		const {
				errorMessage,
				sectionSelected,
				currentChannel,
				channels,
				drawerWidth,
				commentsAutoplay,
				TwitchClient,
				channelData,
				PASS,
				followersNotification,
				notification,
				watchersNotification,
				messages,
				commands,
				botEnabled
			} = this.state,
			propsTopPass = {
				drawerWidth,
				channels,
				botEnabled,
				currentChannel,
				commentsAutoplay,
				TwitchClient,
				channelData,
				PASS,
				followersNotification,
				messages,
				watchersNotification,
				commands
			},
			self = this;

		console.log('render botEnabled', botEnabled);
		var selectedSectionMarkup = null;
		switch (sectionSelected) {
			case ChatComponent.COMPONENT_NAME:
				selectedSectionMarkup = (
					<ChatComponent
						{...propsTopPass}
						updateMessages={this.updateMessageList.bind(this)}
						saveSettings={this.saveSettings.bind(this)}
					/>
				);
				break;
			case UserListComponent.COMPONENT_NAME:
				selectedSectionMarkup = (
					<UserListComponent {...propsTopPass} showNotification={this.showNotification.bind(this)} />
				);
				break;
			case SettingsComponent.COMPONENT_NAME:
				selectedSectionMarkup = (
					<SettingsComponent
						{...this.state}
						saveSettings={this.saveSettings.bind(this)}
						showNotification={this.showNotification.bind(this)}
					/>
				);
				break;
			case FollowersListComponent.COMPONENT_NAME:
				selectedSectionMarkup = <FollowersListComponent {...propsTopPass} />;
				break;
		}
		return (
			<Grid container>
				<MainMenu
					{...this.state}
					saveSettings={this.saveSettings.bind(this)}
					selectSection={sectionSelectedName => self.setState({ sectionSelected: sectionSelectedName })}
				/>

				{selectedSectionMarkup}
				<Snackbar
					open={!!notification}
					transition={props => <Slide direction="up" {...props} />}
					message={<span id="message-id">{notification}</span>}
				/>
			</Grid>
		);
	}
}

export default MainAppContainer;
