import React from 'react';

import { MenuItem, MenuList } from 'material-ui/Menu';
import Paper from 'material-ui/Paper';

class MainMenu extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div>
				<Paper>
					<MenuList>
						<MenuItem>Profile</MenuItem>
						<MenuItem>My account</MenuItem>
						<MenuItem>Logout</MenuItem>
					</MenuList>
				</Paper>
			</div>
		);
	}
}

export default MainMenu;
