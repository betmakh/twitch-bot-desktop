import Grid from 'material-ui/Grid';
import React from 'react';
import Snackbar from 'material-ui/Snackbar';
import Slide from 'material-ui/transitions/Slide';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import { ipcRenderer } from 'electron';
import tmi from 'tmi.js';

import MainMenu from './MainMenu.jsx';
import TwitchClient from '../utils/main';
import ChatComponent from './Chat.jsx';
import UserListComponent from './UserList.jsx';
import SettingsComponent from './Settings.jsx';

class MainAppContainer extends React.Component {
	state = {
		maxMessages: 50,
		drawerWidth: 240,
		channels: [],
		errorMessage: '',
		commentsAutoplay: true,
		currentChannel: '',
		sectionSelected: SettingsComponent.COMPONENT_NAME,
		TwitchClient: null
	};

	saveSettings(settings) {
		this.setState(settings);
		var { channels, commentsAutoplay, currentChannel, PASS, USER, TOKEN } = this.state;
		//send settings to main proccess
		ipcRenderer.send('settings-save', {
			channels,
			commentsAutoplay,
			currentChannel,
			PASS,
			USER,
			TOKEN,
			...settings
		});
	}

	componentWillMount() {
		var self = this;

		// request initial settings
		ipcRenderer.send('settings-request');

		ipcRenderer.on('settings-updated', (event, data) => {
			this.setState(data);
			// this.forceUpdate();
			console.log('this.state', this.state);
			// self.setState(data);
		});

		ipcRenderer.on('error', (event, data) => {
			console.log('error', data);
		});
	}

	render() {
		const { errorMessage, sectionSelected, currentChannel, channels, drawerWidth, commentsAutoplay } = this.state,
			propsTopPass = { drawerWidth, channels, currentChannel, commentsAutoplay },
			self = this;

		var selectedSectionMarkup = null;
		switch (sectionSelected) {
			case ChatComponent.COMPONENT_NAME:
				selectedSectionMarkup = <ChatComponent {...propsTopPass} saveSettings={this.saveSettings.bind(this)} />;
				break;
			case UserListComponent.COMPONENT_NAME:
				selectedSectionMarkup = <UserListComponent {...propsTopPass} />;
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
					saveSettings={this.saveSettings.bind(this)}
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
