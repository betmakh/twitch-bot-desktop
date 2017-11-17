import React from 'react';
import { MenuItem, MenuList } from 'material-ui/Menu';
import Paper from 'material-ui/Paper';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import SettingsIcon from 'material-ui-icons/Settings';
import ChatIcon from 'material-ui-icons/Chat';
import CastIcon from 'material-ui-icons/Cast';
import Drawer from 'material-ui/Drawer';
import Select from 'material-ui/Select';
import ViewListIcon from 'material-ui-icons/ViewList';
import { withStyles } from 'material-ui/styles';
import Divider from 'material-ui/Divider';

import { CHAT_COMPONENT, USER_LIST_COMPONENT, SETTINGS_COMPONENT } from '../utils/constants.js';

const styles = theme => ({
	itemActive: {
		background: theme.palette.common.faintBlack
	},
	drawerHeader: theme.mixins.toolbar
});

class MainMenu extends React.Component {
	handleSectionSelect(sectionName) {
		this.props.selectSection(sectionName);
	}

	render() {
		const { classes, sectionSelected, channels, currentChannel, saveSettings } = this.props;
		return (
			<Drawer type="permanent">
				<MenuItem className={classes.drawerHeader}>
					<Select
						value={currentChannel}
						fullWidth
						onChange={event => {
							saveSettings({ currentChannel: event.target.value });
							console.log('event.target', event.target.value);
						}}
						className={classes.selectEmpty}
					>
						{channels.map(channel => (
							<MenuItem key={channel} value={channel}>
								{channel}
							</MenuItem>
						))}
					</Select>
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
					<MenuItem disabled={1}>
						<ListItemIcon>
							<CastIcon />
						</ListItemIcon>Stream settings
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
