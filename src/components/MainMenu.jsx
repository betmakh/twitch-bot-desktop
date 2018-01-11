import React from 'react';
import { MenuItem, MenuList } from 'material-ui/Menu';
import Paper from 'material-ui/Paper';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import SettingsIcon from 'material-ui-icons/Settings';
import ChatIcon from 'material-ui-icons/Chat';
import Grid from 'material-ui/Grid';
import CastIcon from 'material-ui-icons/Cast';
import Drawer from 'material-ui/Drawer';
import Select from 'material-ui/Select';
import ViewListIcon from 'material-ui-icons/ViewList';
import { withStyles } from 'material-ui/styles';
import Divider from 'material-ui/Divider';
import Avatar from 'material-ui/Avatar';

import {
	CHAT_COMPONENT,
	USER_LIST_COMPONENT,
	SETTINGS_COMPONENT,
	FOLLOWERS_LIST_COMPONENT
} from '../utils/constants.js';

const styles = theme => ({
	itemActive: {
		background: theme.palette.common.faintBlack
	},
	logo: {
		marginRight: theme.spacing.unit,
		maxWidth: theme.spacing.unit * 5
	},
	drawerHeader: theme.mixins.toolbar
});

class MainMenu extends React.Component {
	handleSectionSelect(sectionName) {
		this.props.selectSection(sectionName);
	}

	render() {
		const { classes, sectionSelected, channels, currentChannel, saveSettings, channelData } = this.props;
		// if (!currentChannel && channels) {
		// 	saveSettings({ currentChannel: channels[0] });
		// }
		return (
			<Drawer type="permanent">
				<MenuItem className={classes.drawerHeader}>
					{channelData && <Avatar alt="Remy Sharp" src={channelData.logo} className={classes.logo} />}
					{channels && channels.length ? (
						<Select
							value={currentChannel.toString()}
							fullWidth
							onChange={event => {
								saveSettings({ currentChannel: event.target.value });
							}}
							className={classes.selectEmpty}
						>
							{channels.map(channel => (
								<MenuItem key={channel} value={channel}>
									{channel}
								</MenuItem>
							))}
						</Select>
					) : (
						'No channels configured'
					)}
				</MenuItem>
				<Divider />
				<MenuList style={{ width: this.props.drawerWidth }}>
					<MenuItem
						onClick={this.handleSectionSelect.bind(this, CHAT_COMPONENT)}
						selected={sectionSelected === CHAT_COMPONENT}
					>
						<ListItemIcon>
							<ChatIcon />
						</ListItemIcon>Chat
					</MenuItem>
					<MenuItem
						onClick={this.handleSectionSelect.bind(this, USER_LIST_COMPONENT)}
						selected={sectionSelected === USER_LIST_COMPONENT}
					>
						<ListItemIcon>
							<ViewListIcon />
						</ListItemIcon>List of watchers
					</MenuItem>
					<MenuItem
						onClick={this.handleSectionSelect.bind(this, FOLLOWERS_LIST_COMPONENT)}
						selected={sectionSelected === FOLLOWERS_LIST_COMPONENT}
					>
						<ListItemIcon>
							<CastIcon />
						</ListItemIcon>Followers list
					</MenuItem>
					<MenuItem
						onClick={this.handleSectionSelect.bind(this, SETTINGS_COMPONENT)}
						selected={sectionSelected === SETTINGS_COMPONENT}
					>
						<ListItemIcon>
							<SettingsIcon />
						</ListItemIcon>Setting
					</MenuItem>
				</MenuList>
			</Drawer>
		);
	}
}

export default withStyles(styles)(MainMenu);
