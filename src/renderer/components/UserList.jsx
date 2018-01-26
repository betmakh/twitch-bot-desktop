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
import RefreshIcon from 'material-ui-icons/Refresh';

import { USER_LIST_COMPONENT } from '../utils/constants.js';
import { API } from '../utils/chatUtils.js';
import { styles } from './Chat.jsx';
import UserDetails from './UserDetails.jsx';

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
						subtitle={`(${user.login})`}
						actionIcon={
							<IconButton color="contrast" onClick={onUserOptionsOpen(user)}>
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
		detailsPopUp: {
			open: false,
			user: {}
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

	openUserOptionsMenu(user) {
		return event => {
			var { detailsPopUp } = this.state;

			detailsPopUp = Object.assign(detailsPopUp, {
				open: true,
				user
			});
			this.setState({ detailsPopUp });
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

	closeUserOptionsMenu(action) {
		var { detailsPopUp } = this.state,
			{ TwitchClient, currentChannel, showNotification } = this.props;
		if (action) {
			// TwitchClient[action.actionType](currentChannel, action.user);
			API[`${action.actionType}User`](TwitchClient, action.user, currentChannel, action.reason, action.time)
				.then(resp => {
					showNotification(`Success: ${resp}`);
				})
				.catch(err => {
					showNotification(`Error: ${err}`);
				});
		}
		detailsPopUp.open = false;
		this.setState({ detailsPopUp });
	}

	refreshList(channel = this.props.currentChannel) {
		if (!channel) return;
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

		return (
			<div style={{ marginLeft: drawerWidth }} className={classes.chatContainer}>
				<Modal open={detailsPopUp.open} onClose={this.closeUserOptionsMenu.bind(this, null)}>
					<div className={classes.modal}>
						<UserDetails user={detailsPopUp.user} actionHandler={this.closeUserOptionsMenu.bind(this)} />
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
