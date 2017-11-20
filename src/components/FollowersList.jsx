import { withStyles } from 'material-ui/styles';
import React from 'react';

import { stylesLocal, BasicUserComponent } from './UserList.jsx';
import { API } from '../utils/chatUtils.js';
import { FOLLOWERS_LIST_COMPONENT } from '../utils/constants.js';
// import {stylesLocal} from

class FollowersListComponent extends BasicUserComponent {
	static COMPONENT_NAME = FOLLOWERS_LIST_COMPONENT;
	constructor(params) {
		super(params);
	}
	refreshList(channel = this.props.currentChannel) {
		var self = this;
		self.setState({
			loading: true
		});
		API.getFollowersList(channel).then(json => {
			console.log('json', json);
			if (self._isMounted) {
				self.setState({ users: { Followers: json.follows.map(follow => follow.user.name) }, loading: false });
			}
		});
	}
}

export default withStyles(stylesLocal)(FollowersListComponent);
