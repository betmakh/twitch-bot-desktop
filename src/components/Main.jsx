import Grid from 'material-ui/Grid';
import React from 'react';
import Snackbar from 'material-ui/Snackbar';
import Slide from 'material-ui/transitions/Slide';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import { ipcRenderer } from 'electron';

import MainMenu from './MainMenu.jsx';
import TwitchClient from '../utils/main';
import ChatComponent from './Chat.jsx';
import UserListComponent from './UserList.jsx';
import SettingsComponent from './Settings.jsx';

class MainAppContainer extends React.Component {
	state = {
		connected: true,
		maxMessages: 50,
		drawerWidth: 240,
		channels: [],
		errorMessage: '',
		commentsAutoplay: true,
		currentChannel: '',
		sectionSelected: SettingsComponent.COMPONENT_NAME,
		TwitchClient
	};

	saveSettings(settings) {
		this.setState(settings);
		var { channels, commentsAutoplay, currentChannel } = this.state;
		//send settings to main proccess
		ipcRenderer.send('settings-save', { channels, commentsAutoplay, currentChannel, ...settings });
	}

	componentWillMount() {
		var self = this;

		// request initial settings
		ipcRenderer.send('settings-request');
		ipcRenderer.on('settings-updated', (event, data) => {
			self.setState(data);
		});

		ipcRenderer.on('error', (event, data) => {
			console.log('error', data);
		});
	}

	render() {
		const { errorMessage, sectionSelected, currentChannel, channels, drawerWidth } = this.state,
			propsTopPass = { drawerWidth, channels, currentChannel },
			self = this;

		var selectedSectionMarkup = null;
		switch (sectionSelected) {
			case ChatComponent.COMPONENT_NAME:
				selectedSectionMarkup = <ChatComponent {...propsTopPass} saveSettings={this.saveSettings.bind(this)} />;
				break;
			case UserListComponent.COMPONENT_NAME:
				selectedSectionMarkup = <UserListComponent {...propsTopPass} channelName={currentChannel} />;
				break;
			case SettingsComponent.COMPONENT_NAME:
				selectedSectionMarkup = (
					<SettingsComponent {...propsTopPass} saveSettings={this.saveSettings.bind(this)} />
				);
				break;
		}
		return (
			<Grid container>
				<MainMenu
					{...this.state}
					selectSection={sectionSelectedName => self.setState({ sectionSelected: sectionSelectedName })}
				/>

				{selectedSectionMarkup}
				<Snackbar
					open={errorMessage && errorMessage.length ? true : false}
					transition={props => <Slide direction="up" {...props} />}
					SnackbarContentProps={{
						'aria-describedby': 'message-id'
					}}
					message={<span id="message-id">{errorMessage}</span>}
				/>
			</Grid>
		);
	}
}

export default MainAppContainer;
