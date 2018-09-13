import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { DialogForm } from '../../../components';
import {
  FormControl, FormControlLabel, FormLabel, FormGroup, Checkbox
} from '@material-ui/core';

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

class PreferenceForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      saved: false,
      saving: false,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.weekdays = WEEKDAYS.map(()=>React.createRef());
    this.tasks = WEEKDAYS.map(()=>React.createRef());
  }

  handleSubmit(event) {
    event.preventDefault();
    let payload = {
      preferredDays: this.weekdays.reduce((acc, cur, idx) => {
        if (cur.current.checked) {
          acc.push(idx);
        }
        return acc;
      }, []),
      preferredTasks: this.props.tasks.map(task => task._id).reduce((acc, cur, idx) => {
        if (this.tasks[idx].current.checked) {
          acc.push(cur);
        }
        return acc
      }, [])
    };
    console.log(payload);
    this.setState({saving: true});
    return this.props.submit(payload).then((gotResult) => {
      if (gotResult) {
        this.setState({saving: false, saved: true});
        this.timeout = setTimeout(() => this.setState({saved: false}), 2000)
      }
    })
  }

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  render() {
    let { open, close, tasks, account } = this.props;
    let daySet = new Set(account.preferredDays);
    let taskSet = new Set(account.preferredTasks);
    return (
      <DialogForm open={open} close={close} saved={this.state.saved} title={"Edit My Preferences"}
                  saving={this.state.saving} handleSubmit={this.handleSubmit}>
        <React.Fragment>
          <FormControl component="fieldset" margin={"dense"} fullWidth required>
            <FormLabel component="legend">Select days you can work</FormLabel>
            <FormGroup>
              { WEEKDAYS.map((day, idx) => {
                return <FormControlLabel key={idx} control={
                  <Checkbox inputRef={this.weekdays[idx]} defaultChecked={account.preferredDays ? daySet.has(idx) : true}/>
                } label={day}/>
              }) }
            </FormGroup>
          </FormControl>
          <FormControl component="fieldset" margin={"dense"} fullWidth required>
            <FormLabel component="legend">Select tasks you can do</FormLabel>
            <FormGroup>
              { tasks.map((task, idx) => {
                return <FormControlLabel key={idx} control={
                  <Checkbox inputRef={this.tasks[idx]} defaultChecked={account.preferredTasks ? taskSet.has(task._id) : true}/>
                } label={task.name}/>
              })}
            </FormGroup>
          </FormControl>
        </React.Fragment>
      </DialogForm>
    );
  }
}


PreferenceForm.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
  tasks: PropTypes.array.isRequired,
  account: PropTypes.object.isRequired
};

export default PreferenceForm;