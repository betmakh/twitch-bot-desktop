import React from 'react';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/styles';

const styles = theme => ({
	card: {
		padding: '1em 1.5em'
	}
});

class ChatComponent extends React.Component {
	render() {
		const { messages, classes } = this.props;

		return (
			<Grid>
				{messages.map(msg => (
					<Paper key={msg.id} className={classes.card}>
						<Typography type="title" gutterBottom>
							{msg.user.username}
						</Typography>
						<Typography gutterBottom noWrap>
							{msg.text}
						</Typography>
					</Paper>
				))}
			</Grid>
		);
	}
}

export default withStyles(styles)(ChatComponent);
