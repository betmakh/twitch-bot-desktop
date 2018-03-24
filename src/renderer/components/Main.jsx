import Grid from 'material-ui/Grid';
import React from 'react';
import Snackbar from 'material-ui/Snackbar';
import Slide from 'material-ui/transitions/Slide';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import { ipcRenderer } from 'electron';
import _ from 'lodash';

import MainMenu from './MainMenu.jsx';
// import twitchClient from '../utils/main';
import ChatComponent from './Chat.jsx';
import UserListComponent from './UserList.jsx';
import SettingsComponent from './Settings.jsx';
import FollowersListComponent from './FollowersList.jsx';
import { FollowersWatcher, API } from '../utils/chatUtils.js';
// import ChatMediator from '../utils/chatMediator';
import TwitchClient from '../utils/TwitchClient';

class MainAppContainer extends React.Component {
	state = {
		maxMessages: 50,
		drawerWidth: 240,
		channels: [],
		notification: null,
		commentsAutoplay: true,
		currentChannel: '',
		sectionSelected: ChatComponent.COMPONENT_NAME,
		twitchClient: null,
		FollowersWatcher,
		channelData: null,
		followersNotification: false,
		watchersNotification: false,
		commands: [],
		botEnabled: false,
		messages: [],
		widgetUrl: ''
	};
	saveSettings(settings) {
		var paramsObj = _.pick(this.state, [
			'channels',
			'commentsAutoplay',
			'commands',
			'currentChannel',
			'botEnabled',
			'PASS',
			'TOKEN',
			'followersNotification',
			'watchersNotification',
			'sectionSelected',
			'widgetUrl'
		]);
		ipcRenderer.send('settings-save', Object.assign(paramsObj, settings));
	}

	showNotification(notification, delay = 7000) {
		var that = this,
			{ twitchClient } = this.state;
		if (twitchClient) {
			twitchClient.action(this.state.currentChannel, notification);
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
			var { currentChannel, FollowersWatcher, twitchClient, PASS } = self.state;
			if (!data.followersNotification) {
				FollowersWatcher.stop();
			} else {
				FollowersWatcher.start(data.currentChannel, follows => {
					self.showNotification(
						'New followers: ' + follows.map(follow => follow.user.display_name).join(', ')
					);
				});
			}
			if (!twitchClient) {
				twitchClient = new TwitchClient({
					identity: {
						password: `oauth:${data.PASS}`,
						username: 'null'
					},
					channels: [currentChannel]
				});
			}

			if (data.PASS !== PASS) {
				twitchClient.updatePass(data.PASS);
			}

			twitchClient.connect().then(() => {
				if (currentChannel !== data.currentChannel && data.currentChannel) {
					twitchClient.chageChannel(data.currentChannel);
					API.getChannelInfo(data.currentChannel).then(resp => {
						self.setState({ channelData: resp });
					});
				}
				twitchClient.removeAllListeners('join');
				if (data.watchersNotification) {
					twitchClient.on('join', (channel, username, byOwn) => {
						self.showNotification(`New watcher. Cheers for @${username}`);
					});
				}
				twitchClient.enableBot(data.botEnabled, data.commands);
				self.setState({ twitchClient });
				self.setState(data);
			});
		});

		ipcRenderer.on('error', (event, data) => {});
	}

	updateMessageList(messages) {
		this.setState({ messages });
	}

	render() {
		const { errorMessage, notification, sectionSelected } = this.state,
			propsTopPass = _.pick(this.state, [
				'drawerWidth',
				'channels',
				'botEnabled',
				'currentChannel',
				'sectionSelected',
				'commentsAutoplay',
				'widgetUrl',
				'twitchClient',
				'channelData',
				'PASS',
				'followersNotification',
				'messages',
				'watchersNotification',
				'commands'
			]),
			self = this;

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
						{...propsTopPass}
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
					{...propsTopPass}
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
