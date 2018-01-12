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

class MainAppContainer extends React.Component {
	state = {
		maxMessages: 50,
		drawerWidth: 240,
		channels: [],
		notification: null,
		commentsAutoplay: true,
		currentChannel: '',
		sectionSelected: UserListComponent.COMPONENT_NAME,
		TwitchClient: null,
		FollowersWatcher,
		channelData: null,
		followersNotification: true,
		botEnabled: false,
		messages: []
	};
	saveSettings(settings) {
		var { channels, commentsAutoplay, currentChannel, botEnabled, PASS, TOKEN, followersNotification } = this.state;
		ipcRenderer.send('settings-save', {
			channels,
			commentsAutoplay,
			currentChannel,
			PASS,
			TOKEN,
			botEnabled,
			followersNotification,
			...settings
		});
	}

	showNotification(notification, delay = 3000) {
		var that = this;
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
			const { currentChannel, FollowersWatcher } = self.state;
			if (!data.followersNotification) {
				FollowersWatcher.stop();
			} else {
				FollowersWatcher.start(data.currentChannel, follows => {
					self.showNotification(
						'New followers: ' + follows.reduce((res, val) => `${res}, ${val.user.display_name}`, '')
					);
					console.log('follows', follows);
				});
			}
			if (data.PASS && (currentChannel !== data.currentChannel || !self.state.TwitchClient)) {
				// update connection if selected channel has changed
				if (self.state.TwitchClient) {
					self.state.TwitchClient.disconnect();
				}
				var TwitchClient = new tmi.client({
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
					channels: [data.currentChannel]
				});

				self.setState({ TwitchClient });
			}
			if (data.currentChannel) {
				API.getChannelInfo(data.currentChannel).then(resp => {
					self.setState({ channelData: resp });
				});
			}
			self.setState(data);
		});

		ipcRenderer.on('error', (event, data) => {
			console.log('error', data);
		});
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
				messages
			} = this.state,
			propsTopPass = {
				drawerWidth,
				channels,
				currentChannel,
				commentsAutoplay,
				TwitchClient,
				channelData,
				PASS,
				followersNotification,
				messages
			},
			self = this;

		var selectedSectionMarkup = null;
		switch (sectionSelected) {
			case ChatComponent.COMPONENT_NAME:
				selectedSectionMarkup = (
					<ChatComponent
						{...this.state}
						updateMessages={this.updateMessageList.bind(this)}
						saveSettings={this.saveSettings.bind(this)}
					/>
				);
				break;
			case UserListComponent.COMPONENT_NAME:
				selectedSectionMarkup = <UserListComponent {...propsTopPass} />;
				break;
			case SettingsComponent.COMPONENT_NAME:
				selectedSectionMarkup = (
					<SettingsComponent {...this.state} saveSettings={this.saveSettings.bind(this)} />
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
