import Grid from 'material-ui/Grid';
import React from 'react';

import MainMenu from './MainMenu.jsx';
import TwitchClient from '../utils/main';
import ChatComponent from './Chat.jsx';
import { GetMessageAudio } from '../utils/ChatUtils.js';
import Slide from 'material-ui/transitions/Slide';
import Snackbar from 'material-ui/Snackbar';

const drawerWidth = 240;

class MainAppContainer extends React.Component {
	state = {
		connected: true,
		messages: [],
		maxMessages: 50,
		drawerWidth,
		channels: [],
		errorMessage: '',
		messageAutoplay: true,
		sectionSelected: ChatComponent.COMPONENT_NAME,
		TwitchClient
	};

	handleToggleAutoplay() {
		this.setState({ messageAutoplay: !this.state.messageAutoplay });
	}

	constructor(props) {
		super(props);
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
