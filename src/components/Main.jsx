import Grid from 'material-ui/Grid';
import React from 'react';
import Snackbar from 'material-ui/Snackbar';
import Slide from 'material-ui/transitions/Slide';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';

import MainMenu from './MainMenu.jsx';
import TwitchClient from '../utils/main';
import ChatComponent from './Chat.jsx';
import UserListComponent from './UserList.jsx';

const drawerWidth = 240;

class MainAppContainer extends React.Component {
	state = {
		connected: true,
		maxMessages: 50,
		drawerWidth,
		channels: [],
		errorMessage: '',
		messageAutoplay: true,
		sectionSelected: UserListComponent.COMPONENT_NAME,
		TwitchClient
	};

	handleToggleAutoplay() {
		this.setState({ messageAutoplay: !this.state.messageAutoplay });
	}

	constructor(props) {
		super(props);
		this.state.TwitchClient.connect();
	}

	render() {
		const { errorMessage, sectionSelected } = this.state,
			self = this;

		var selectedSectionMarkup = null;
		switch (sectionSelected) {
			case ChatComponent.COMPONENT_NAME:
				selectedSectionMarkup = (
					<ChatComponent {...this.state} handleToggleAutoplay={this.handleToggleAutoplay.bind(this)} />
				);
				break;
			case UserListComponent.COMPONENT_NAME:
				selectedSectionMarkup = (
					<UserListComponent {...this.state} channelName={'betmanenko'} />
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
