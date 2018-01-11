import React from 'react';
import PropTypes from 'prop-types';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import { withStyles } from 'material-ui/styles';
import IconButton from 'material-ui/IconButton';
import { ipcRenderer } from 'electron';
import Menu, { MenuItem } from 'material-ui/Menu';
import { CircularProgress } from 'material-ui/Progress';
import Modal from 'material-ui/Modal';
import MoreVertIcon from 'material-ui-icons/MoreVert';
import Subheader from 'material-ui/List/ListSubheader';
import InfoIcon from 'material-ui-icons/Info';
import Tooltip from 'material-ui/Tooltip';
import Divider from 'material-ui/Divider';
import { GridList, GridListTile, GridListTileBar } from 'material-ui/GridList';
import _ from 'lodash';

import RefreshIcon from 'material-ui-icons/Refresh';

import { USER_LIST_COMPONENT } from '../utils/constants.js';
import { API } from '../utils/chatUtils.js';
import { styles } from './Chat.jsx';

export const stylesLocal = theme =>
	Object.assign(styles(theme), {
		searchFieldContainer: {
			padding: '0.5em'
		},
		spacingBlock: {
			paddingRight: theme.spacing.unit,
			paddingLeft: theme.spacing.unit
		},
		listItem: {
			position: 'relative'
		},
		textCenter: {
			textAlign: 'center'
		},
		modal: {
			position: 'absolute',
			width: 8 * 50,
			top: `50%`,
			left: `50%`,
			transform: `translate(-50%, -50%)`,
			border: '1px solid #e5e5e5',
			backgroundColor: '#fff',
			boxShadow: '0 5px 15px rgba(0, 0, 0, .5)',
			padding: 8 * 4
		}
	});

const UserGroupList = withStyles(stylesLocal)(props => {
	const { groupTitle, users, classes, onUserOptionsOpen } = props;
	return (
		<GridList cellHeight={180} cols={3}>
			<GridListTile key="Subheader" cols={3} style={{ height: 'auto' }}>
				<Subheader component="div">{groupTitle}</Subheader>
			</GridListTile>
			{users.map(user => (
				<GridListTile key={user.login}>
					<img src={user.profile_image_url || 'assets/GlitchIcon_purple.png'} alt={user.login} />
					<GridListTileBar
						title={user.display_name}
						actionIcon={
							<IconButton onClick={onUserOptionsOpen(user.login)}>
								<MoreVertIcon />
							</IconButton>
						}
					/>
				</GridListTile>
			))}
		</GridList>
	);
});

class UserListComponent extends React.Component {
	static COMPONENT_NAME = USER_LIST_COMPONENT;
	static propTypes = {
		currentChannel: PropTypes.string.isRequired,
		classes: PropTypes.object.isRequired
	};

	state = {
		searchCriteria: '',
		optionsMenu: {},
		detailsPopUp: {
			open: false,
			reason: false,
			time: false
		},
		users: [],
		totalUsersCount: 0,
		usersData: new Map()
	};

	componentWillMount() {
		this._isMounted = true;
		this.refreshList();
	}

	// indicate component removed to stop handle async events
	componentWillUnmount() {
		this._isMounted = false;
	}

	openUserOptionsMenu(userName) {
		return event => {
			var options = this.state.optionsMenu;
			options = Object.assign(options, {
				anchor: event.currentTarget,
				user: userName
			});
			this.setState({ optionsMenu: options });
		};
	}

	filterUserList(event) {
		if (event.target.value.length >= 2) {
			this.setState({
				loading: true
			});
			ipcRenderer.send('chatters-filter', this.props.currentChannel, event.target.value);
		} else if (event.target.value.length === 0) {
			this.setState({
				loading: true
			});
			ipcRenderer.send('chatters-get', this.props.currentChannel);
		}

		this.setState({ searchCriteria: event.target.value });
	}

	handleUserAction(type = 'mod', user) {
		var { detailsPopUp } = this.state;

		switch (type) {
			case 'mod':
				API.modUser(this.props.TwitchClient, user);
				detailsPopUp.open = false;

				break;
			case 'ban':
				detailsPopUp.open = true;
				detailsPopUp.user = user;
				detailsPopUp.reason = true;
				detailsPopUp.action = 'ban';

				break;
			case 'timeout':
				detailsPopUp.user = user;
				detailsPopUp.open = true;
				detailsPopUp.reason = true;
				detailsPopUp.action = 'timeout';
				detailsPopUp.time = true;
				break;
		}
		this.setState({ detailsPopUp });
	}

	closeUserOptionsMenu(action, event) {
		var { optionsMenu, detailsPopUp } = this.state;
		var options = this.state.optionsMenu;
		optionsMenu.anchor = null;
		if (action) {
			this.handleUserAction(action, options.user);
		} else {
			detailsPopUp.open = false;
		}
		this.setState({ optionsMenu, detailsPopUp });
	}

	refreshList(channel = this.props.currentChannel) {
		var self = this,
			usersData = this.state.usersData;

		self.setState({
			loading: true
		});
		ipcRenderer.send('chatters-get', channel);
		ipcRenderer.on('chatters-received', (event, data) => {
			if (self._isMounted) {
				self.setState({ users: data.users, totalUsersCount: data.totalUsersCount, loading: false });
			}
		});
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.currentChannel !== nextProps.currentChannel) {
			this.refreshList(nextProps.currentChannel);
		}
	}

	render() {
		const { drawerWidth, classes, currentChannel } = this.props,
			{ users, searchCriteria, loading, usersData, totalUsersCount, detailsPopUp } = this.state,
			optionsMenuID = 'user-options',
			options = ['ban', 'timeout', 'mod'];

		var groupsMarkup = [];

		// for (let group in users) {
		// 	if (users[group].length && !loading) {
		// 		groupsMarkup.push(
		// 			<UserGroupList
		// 				onUserOptionsOpen={this.openUserOptionsMenu.bind(this)}
		// 				key={group}
		// 				groupTitle={group}
		// 				usersData={usersData}
		// 				users={filtered}
		// 			/>
		// 		);
		// 	}
		// }

		return (
			<div style={{ marginLeft: drawerWidth }} className={classes.chatContainer}>
				<Menu
					id={optionsMenuID}
					anchorEl={this.state.optionsMenu.anchor}
					open={!!this.state.optionsMenu.anchor}
					onClose={this.closeUserOptionsMenu.bind(this, null)}
					PaperProps={{
						style: {
							width: 200
						}
					}}
				>
					{options.map(option => (
						<MenuItem key={option} onClick={this.closeUserOptionsMenu.bind(this, option)}>
							{option}
						</MenuItem>
					))}
				</Menu>
				<Modal open={detailsPopUp.open} onClose={this.closeUserOptionsMenu.bind(this, null)}>
					<div className={classes.modal}>
						<Typography type="title" id="modal-title">
							{`Are you sure you wnat to ${detailsPopUp.action} ${detailsPopUp.user}?`}
						</Typography>
					</div>
				</Modal>
				<AppBar position="static" color="primary" className={classes.header}>
					<Toolbar>
						<Typography type="title" color="inherit">
							Chatters at {currentChannel} ({totalUsersCount})
						</Typography>
						<IconButton onClick={event => this.refreshList()}>
							<Tooltip id="tooltip-right" title="Refresh" placement="right">
								<RefreshIcon color="inherit" />
							</Tooltip>
						</IconButton>
					</Toolbar>
				</AppBar>

				<Grid container spacing={0} className={[classes.chatBody, classes.spacingBlock].join(' ')}>
					<Grid item xs={12} className={classes.searchFieldContainer}>
						<TextField placeholder="Filter users" onChange={this.filterUserList.bind(this)} fullWidth />
					</Grid>
					{loading ? (
						<Grid item xs={12}>
							<div className={classes.textCenter}>
								<CircularProgress size={100} color="accent" />
							</div>
						</Grid>
					) : (
						<Grid item xs={12}>
							<UserGroupList
								onUserOptionsOpen={this.openUserOptionsMenu.bind(this)}
								groupTitle={'All watchers'}
								users={users}
							/>
						</Grid>
					)}
				</Grid>
			</div>
		);
	}
}

export const BasicUserComponent = UserListComponent;

export default withStyles(stylesLocal)(UserListComponent);
