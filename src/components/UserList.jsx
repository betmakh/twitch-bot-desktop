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
import MoreVertIcon from 'material-ui-icons/MoreVert';

import { USER_LIST_COMPONENT } from '../utils/constants.js';
import { API } from '../utils/chatUtils.js';
import {styles} from './Chat.jsx';

const stylesLocal = theme => (Object.assign(styles(theme), {
	searchFieldContainer: {
		padding: '0.5em'
	}
}))

const UserGroupList = withStyles(stylesLocal)(props => {
	const {groupTitle, users, classes, onUserOptionsOpen} = props;
	return (<Grid container spacing={0}>
		<Grid item xs={12}><Typography type="display1" className={classes.card}>{groupTitle}</Typography></Grid>
		{users.map(username => (<Grid key={username} item xs={12} sm={6}><Paper className={classes.card}><br/><Typography type="title" gutterBottom>{username}</Typography>
	        	<IconButton className={classes.playButton}
		          aria-label="More"
		          aria-owns={open ? 'long-menu' : null}
		          aria-haspopup="true"
		          onClick={onUserOptionsOpen(username)}
		        >
          <MoreVertIcon />
        </IconButton>
			</Paper></Grid>))}

		</Grid>)
})

class UserListComponent extends React.Component {

	static COMPONENT_NAME = USER_LIST_COMPONENT;
	static propTypes = {
		channelName: PropTypes.string.isRequired,
		classes: PropTypes.object.isRequired
	}

	constructor(props) {
	    super(props);
	    this.state = {
	    	searchCriteria: '',
	    	optionsMenu: {},
	        users: {
	            // "moderators": [
	            //     "betmanenko",
	            //     "betmanenkobot"
	            // ],
	            // "staff": ["staff1", "dura"],
	            // "admins": ["uber228", "jeka iz zheka", 'nigga1337'],
	            // "global_mods": ["uber228", "jeka iz zheka", 'nigga1337', "staff1", "dura"],
	            // "viewers": ["jeka iz zheka", 'nigga1337', "staff1", "dura"]
	        }
	    }
	}

	componentWillMount() {
		var self = this;
		API.getViewers(this.props.channelName).then(json => {
			self.setState({users: json.chatters})
		})
	}
	
	openUserOptionsMenu(userName) {
		return event => {
			var options = this.state.optionsMenu;
			options = Object.assign(options, {
				anchor: event.currentTarget,
				user: userName
			})
			this.setState({optionsMenu: options})
		}

	}

	filterUserList(event) {
		this.setState({searchCriteria: event.target.value})
	}

	closeUserOptionsMenu(action, event) {
		console.log("action", action);
		var options = this.state.optionsMenu;
		options.anchor = null
		this.setState({optionsMenu: options})
	}

	render() {
		const {drawerWidth, classes, channelName} = this.props,
			{users, searchCriteria} = this.state,
			optionsMenuID = 'user-options',
			options = ['ban', 'timeout', 'mod'];

		var groupsMarkup = [];

		for (let group in users) {
			if (users[group].length) {
				groupsMarkup.push(<UserGroupList onUserOptionsOpen={this.openUserOptionsMenu.bind(this)} key={group} groupTitle={group} users={users[group].filter(name => !!~name.toUpperCase().indexOf(searchCriteria.toUpperCase()))}/>)
				//let groupUserListMarkup = users[group].map(username => (<Grid item xs={12} sm={6}><Paper><Typography type="title" gutterBottom>{username}</Typography></Paper></Grid>));
				// groupsMarkup.push((<Grid item xs={12}><Paper><Typography type="display1">{group}</Typography></Paper></Grid>{groupUserListMarkup}))
			}
		}

		return (<div style={{ marginLeft: drawerWidth }} className={classes.chatContainer}>

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
						{`Users list (${channelName} channel)`}
					</Typography>
				</Toolbar>
			</AppBar>
			<Grid container spacing={0} className={classes.chatBody}>
			<Grid item xs={12} className={classes.searchFieldContainer}>
				<TextField
					placeholder="Filter users"
					onChange={this.filterUserList.bind(this)}
			      fullWidth
			    />
			</Grid>
			<Grid item xs={12}>
				{groupsMarkup}
			</Grid>

			</Grid>
			</div>)
	}
}

export default withStyles(stylesLocal)(UserListComponent);