import React from 'react';
import { MenuItem, MenuList } from 'material-ui/Menu';
import Paper from 'material-ui/Paper';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import SettingsIcon from 'material-ui-icons/Settings';
import ChatIcon from 'material-ui-icons/Chat';
import CastIcon from 'material-ui-icons/Cast';
import Drawer from 'material-ui/Drawer';
import ViewListIcon from 'material-ui-icons/ViewList';
import { withStyles } from 'material-ui/styles';

import { CHAT_COMPONENT, USER_LIST_COMPONENT } from '../utils/constants.js';

const styles = theme => ({
	itemActive: {
		background: theme.palette.common.faintBlack
	}
});

class MainMenu extends React.Component {
	constructor(props) {
		super(props);
	}

	handleSectionSelect(sectionName) {
		this.props.selectSection(sectionName);
	}

	render() {
		const { classes, sectionSelected } = this.props;
		return (
			<Drawer type="permanent">
				<MenuList style={{ width: this.props.drawerWidth }}>
					<MenuItem
						onClick={this.handleSectionSelect.bind(this, CHAT_COMPONENT)}
						className={sectionSelected === CHAT_COMPONENT ? classes.itemActive : ''}
					>
						<ListItemIcon>
							<ChatIcon />
						</ListItemIcon>Chat
					</MenuItem>
					<MenuItem
						onClick={this.handleSectionSelect.bind(this, USER_LIST_COMPONENT)}
						className={sectionSelected === USER_LIST_COMPONENT ? classes.itemActive : ''}
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
					<MenuItem>
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
