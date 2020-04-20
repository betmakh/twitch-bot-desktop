import React from "react";
import Grid from "@material-ui/core/Grid";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Input from "@material-ui/core/Input";
import Radio, { RadioGroup } from "@material-ui/core/Radio";
import {
  FormLabel,
  FormControl,
  FormControlLabel,
  FormHelperText,
} from "@material-ui/core";

class UserDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      reason: "Bad behaviour",
      time: 600,
      actionType: "",
    };
  }

  handleChange(event, value) {
    console.log("event", event);
    if (value) {
      this.setState({
        actionType: value,
      });
    } else {
      this.setState({
        [event.target.name]: event.target.value,
      });
    }
  }
  render() {
    const { user } = this.props,
      { actionType, reason, time } = this.state;
    return (
      <div>
        <Typography type="title" gutterBottom>
          {`${user.login}`}
        </Typography>
        <Grid container>
          <Grid item xs={5}>
            <FormControl component="fieldset" required>
              <FormLabel component="legend">Select action</FormLabel>
              <RadioGroup
                aria-label="action"
                value={this.state.actionType}
                onChange={this.handleChange.bind(this)}
              >
                <FormControlLabel value="ban" control={<Radio />} label="Ban" />
                <FormControlLabel value="mod" control={<Radio />} label="Mod" />
                <FormControlLabel
                  value="timeout"
                  control={<Radio />}
                  label="Timeout"
                />
              </RadioGroup>
            </FormControl>
          </Grid>
          {(actionType === "ban" || actionType === "timeout") && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="reason"
                label="Reason"
                onChange={this.handleChange.bind(this)}
                value={this.state.reason}
                margin="normal"
              />
            </Grid>
          )}
          {actionType === "timeout" && (
            <Grid item xs={12}>
              <TextField
                onChange={this.handleChange.bind(this)}
                label="Time(in seconds)"
                name="time"
                fullWidth
                value={this.state.time}
                type="number"
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <Button
              color="primary"
              onClick={() =>
                this.props.actionHandler({
                  actionType,
                  reason,
                  time,
                  user: user.login,
                })
              }
            >
              Apply
            </Button>
            <Button onClick={() => this.props.actionHandler()}>Cancel</Button>
          </Grid>
        </Grid>
      </div>
    );
  }
}

UserDetails.propTypes = {
  user: PropTypes.object.isRequired,
  actionHandler: PropTypes.func.isRequired,
  // classes: PropTypes.object.isRequired
};

export default UserDetails;
