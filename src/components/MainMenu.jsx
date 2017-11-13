import React from 'react';

import { MenuItem, MenuList } from 'material-ui/Menu';
import Paper from 'material-ui/Paper';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import SettingsIcon from 'material-ui-icons/Settings';
import ChatIcon from 'material-ui-icons/Chat';
import CastIcon from 'material-ui-icons/Cast';
import Drawer from 'material-ui/Drawer';
import ViewListIcon from 'material-ui-icons/ViewList';

class MainMenu extends React.Component {
	constructor(props) {
		super(props);
	}

	// render() {
	// 	return (
	// 		<Drawer type="permanent">
	// 			<MenuList>
	// 				<MenuItem>
	// 					<ListItemIcon>
	// 						<ChatIcon />
	// 					</ListItemIcon>Chat
	// 				</MenuItem>
	// 				<MenuItem>
	// 					<ListItemIcon>
	// 						<SettingsIcon />
	// 					</ListItemIcon>My account
	// 				</MenuItem>
	// 				<MenuItem>
	// 					<ListItemIcon>
	// 						<CastIcon />
	// 					</ListItemIcon>Stream settings
	// 				</MenuItem>
	// 				<MenuItem>
	// 					<ListItemIcon>
	// 						<ViewListIcon />
	// 					</ListItemIcon>List of watchers
	// 				</MenuItem>
	// 			</MenuList>
	// 		</Drawer>
	// 	);
	// }

	render() {
		return (
			<Paper>
				<MenuList>
					<MenuItem>
						<ListItemIcon>
							<ChatIcon />
						</ListItemIcon>Chat
					</MenuItem>
					<MenuItem>
						<ListItemIcon>
							<SettingsIcon />
						</ListItemIcon>My account
					</MenuItem>
					<MenuItem>
						<ListItemIcon>
							<CastIcon />
						</ListItemIcon>Stream settings
					</MenuItem>
					<MenuItem>
						<ListItemIcon>
							<ViewListIcon />
						</ListItemIcon>List of watchers
					</MenuItem>
				</MenuList>
			</Paper>
		);
	}
}

export default MainMenu;
