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
import Menu, { MenuItem } from 'material-ui/Menu';
import { CircularProgress } from 'material-ui/Progress';
import MoreVertIcon from 'material-ui-icons/MoreVert';
import Tooltip from 'material-ui/Tooltip';
import Divider from 'material-ui/Divider';

import RefreshIcon from 'material-ui-icons/Refresh';

import { USER_LIST_COMPONENT } from '../utils/constants.js';
import { API } from '../utils/chatUtils.js';
import { styles } from './Chat.jsx';

export const stylesLocal = theme =>
	Object.assign(styles(theme), {
		searchFieldContainer: {
			padding: '0.5em'
		},
		listItem: {
			position: 'relative'
		},
		textCenter: {
			textAlign: 'center'
		}
	});

const UserGroupList = withStyles(stylesLocal)(props => {
	const { groupTitle, users, classes, onUserOptionsOpen } = props;
	return (
		<Grid container spacing={0}>
			<Grid item xs={12}>
				<Typography type="display1" className={classes.card}>
					{groupTitle}
				</Typography>
			</Grid>
			{users.map(username => (
				<Grid key={username} item xs={12} sm={6} className={classes.listItem}>
					<Divider />
					<br />
					<Typography type="title" gutterBottom>
						{username}
					</Typography>
					<IconButton
						className={classes.playButton}
						aria-label="More"
						aria-owns={open ? 'long-menu' : null}
						aria-haspopup="true"
						onClick={onUserOptionsOpen(username)}
					>
						<MoreVertIcon />
					</IconButton>
				</Grid>
			))}
		</Grid>
	);
});

class UserListComponent extends React.Component {
	static COMPONENT_NAME = USER_LIST_COMPONENT;
	static propTypes = {
		currentChannel: PropTypes.string.isRequired,
		classes: PropTypes.object.isRequired
	};

	componentWillMount() {
		console.log('mounted');
		this.setState({
			searchCriteria: '',
			optionsMenu: {},
			users: {}
		});
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
		this.setState({ searchCriteria: event.target.value });
	}

	closeUserOptionsMenu(action, event) {
		var options = this.state.optionsMenu;
		options.anchor = null;
		this.setState({ optionsMenu: options });
	}

	refreshList(channel = this.props.currentChannel) {
		var self = this;
		self.setState({
			loading: true
		});
		API.getViewers(channel).then(json => {
			if (self._isMounted) {
				self.setState({ users: json.chatters, loading: false });
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
			{ users, searchCriteria, loading } = this.state,
			optionsMenuID = 'user-options',
			options = ['ban', 'timeout', 'mod'];

		var groupsMarkup = [];

		for (let group in users) {
			if (users[group].length && !loading) {
				groupsMarkup.push(
					<UserGroupList
						onUserOptionsOpen={this.openUserOptionsMenu.bind(this)}
						key={group}
						groupTitle={group}
						users={users[group].filter(name => !!~name.toUpperCase().indexOf(searchCriteria.toUpperCase()))}
					/>
				);
			}
		}

		return (
			<div style={{ marginLeft: drawerWidth }} className={classes.chatContainer}>
				<Menu
					id={optionsMenuID}
					anchorEl={this.state.optionsMenu.anchor}
					open={!!this.state.optionsMenu.anchor}
					onRequestClose={this.closeUserOptionsMenu.bind(this)}
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
				<AppBar position="static" color="primary" className={classes.header}>
					<Toolbar>
						<Typography type="title" color="inherit">
							{`Users list (${currentChannel} channel)`}
						</Typography>
						<IconButton onClick={event => this.refreshList()}>
							<Tooltip id="tooltip-right" title="Refresh" placement="right">
								<RefreshIcon />
							</Tooltip>
						</IconButton>
					</Toolbar>
				</AppBar>

				{loading ? (
					<Grid container spacing={0} className={classes.chatBody}>
						<Grid item xs={12}>
							<div className={classes.textCenter}>
								<CircularProgress size={100} color="accent" />
							</div>
						</Grid>
					</Grid>
				) : (
					<Grid container spacing={0} className={classes.chatBody}>
						<Grid item xs={12} className={classes.searchFieldContainer}>
							<TextField placeholder="Filter users" onChange={this.filterUserList.bind(this)} fullWidth />
						</Grid>
						<Grid item xs={12}>
							{groupsMarkup}
						</Grid>
					</Grid>
				)}
			</div>
		);
	}
}

export const BasicUserComponent = UserListComponent;

export default withStyles(stylesLocal)(UserListComponent);
