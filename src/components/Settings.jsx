import { withStyles } from 'material-ui/styles';
import React from 'react';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
// import PropTypes from 'prop-types';
// import Grid from 'material-ui/Grid';
// import Typography from 'material-ui/Typography';
// import AppBar from 'material-ui/AppBar';
// import Toolbar from 'material-ui/Toolbar';
// import Paper from 'material-ui/Paper';
// import TextField from 'material-ui/TextField';
// import { withStyles } from 'material-ui/styles';
// import IconButton from 'material-ui/IconButton';
// import Menu, { MenuItem } from 'material-ui/Menu';
// import MoreVertIcon from 'material-ui-icons/MoreVert';
// 
import { SETTINGS_COMPONENT } from '../utils/constants.js';
import {styles} from './Chat.jsx';


const stylesLocal = theme => (Object.assign(styles(theme), {
	spacingBlock: {
		padding: `0 ${theme.spacing.unit}px`
	}
}))

class SettingsComponent extends React.Component {
	static COMPONENT_NAME = SETTINGS_COMPONENT;

	state = {

	}
	handleChange(name) {
		return event => {

		}
		this.setState({[name]:event.target.value})
	}
	render() {
		const {drawerWidth, classes} = this.props;
		return(<div style={{ marginLeft: drawerWidth }} className={classes.chatContainer}>

			<AppBar position="static" color="primary" className={classes.header}>
				<Toolbar>
					<Typography type="title" color="inherit">
						{'Settings'}
					</Typography>
				</Toolbar>
			</AppBar>
			<Grid container spacing={0} alignItems='baseline' className={classes.chatBody}>
			{/*<Grid container spacing={0} alignItems={baseline}></Grid>*/}
			<Grid item xs={12} className={classes.spacingBlock}>
				<Paper className={classes.spacingBlock} style={{width: '100%'}}>
			<Grid item xs={12} sm={12} md={10} className={classes.spacingBlock}>
				<TextField
		          id="channelNameField"
		          placeholder="Channel name"
		          className={classes.textField}
		          value={this.state.channelNameField}
		          onChange={this.handleChange('channelNameField')}
		          margin="normal"
		          fullWidth
		        />
			</Grid>
			<Grid item xs={12} sm={12} md={2} className={classes.spacingBlock}>
				<Button style={{width: '100%'}}>Add channel</Button>
			</Grid>
		        </Paper>
</Grid>

			</Grid>
			</div>)
	}
}

export default withStyles(stylesLocal)(SettingsComponent)