import React from 'react';
import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';
import PropTypes from 'prop-types';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';
import Input from 'material-ui/Input';
import { MenuItem } from 'material-ui/Menu';
import Select from 'material-ui/Select';
import Radio, { RadioGroup } from 'material-ui/Radio';
import { FormLabel, FormControl, FormControlLabel, FormHelperText } from 'material-ui/Form';

import { BOT_COMMANDS_DESCRIPTION } from '../utils/constants.js';

class BotCommandDetails extends React.Component {
	static propTypes = {
		command: PropTypes.object.isRequired,
		actionHandler: PropTypes.func.isRequired
	};

	state = {
		text: '',
		type: 'text',
		command: '',
		commandTypes: ['text'],
		header: 'Create bot command',
		placeholdersDescription: (
			<div>
				<Typography component="p" gutterBottom>
					Availible commands so far:
				</Typography>

				<ul>
					{BOT_COMMANDS_DESCRIPTION.map((cmd, index) => (<li key={index}>
							<b>{cmd.name}</b> - {cmd.description}
						</li>
					))}
				</ul>
			</div>
		)
	};

	componentWillMount() {
		var { command } = this.props;
		if (Object.keys(command).length) {
			this.setState({
				header: 'Edit bot command'
			});
		}
		this.handleChange = this.handleChange.bind(this);
		this.saveCommand = this.saveCommand.bind(this);
		var state = { ...command };
		this.setState(command);
	}

	saveCommand(event) {
		var { text, type, command } = this.state;

		if (text && type && command) {
			this.props.actionHandler({ text, type, command });
		}
	}

	handleChange(event) {
		this.setState({
			[event.target.name]: event.target.value
		});
	}
	render() {
		const { text, type, command, commandTypes, header, placeholdersDescription } = this.state;
		return (
			<div>
				<Typography type="title" gutterBottom>
					{header}
				</Typography>
				{placeholdersDescription}

				<Grid container alignItems="baseline">
					<Grid item xs={6}>
						<TextField
							placeholder="Command"
							margin="normal"
							value={command}
							onChange={this.handleChange}
							fullWidth
							name="command"
						/>
					</Grid>
					<Grid item xs={6}>
						<Select
							value={type || commandTypes[0].toString()}
							fullWidth
							name="type"
							onChange={this.handleChange}
						>
							{commandTypes.map(commandType => (
								<MenuItem key={commandType} value={commandType}>
									{commandType}
								</MenuItem>
							))}
						</Select>
					</Grid>
					<Grid item xs={12}>
						<TextField
							onChange={this.handleChange}
							fullWidth
							label="Command text"
							name="text"
							value={text}
							multiline
							rowsMax="4"
						/>
					</Grid>
					<Grid item xs={12}>
						<Button color="primary" onClick={this.saveCommand}>
							Save
						</Button>
						<Button onClick={e => this.props.actionHandler()}>cancel</Button>
					</Grid>
				</Grid>
			</div>
		);
	}
}

export default BotCommandDetails;
