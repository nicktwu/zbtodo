import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  FormControl, InputLabel, Input, FormHelperText, Select, MenuItem, Button
} from '@material-ui/core';
import { DialogForm } from "../../../components";

class MidnightForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      numberError: false,
      saved: false,
      saving: false,
      task: props.defaultMidnight ? props.defaultMidnight.task._id : "",
      points: props.defaultMidnight ? props.defaultMidnight.potential : 0,
      account: props.defaultMidnight ? props.defaultMidnight.account._id : ""
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.date = React.createRef();
    this.note = React.createRef();
    this.taskSelect = this.taskSelect.bind(this);
  }

  taskSelect(event) {
    let taskId = event.target.value;
    let taskVal = this.props.tasks.reduce((acc, current) => (current._id === taskId ? acc + current.value : acc), 0);
    this.setState({task: taskId, points: taskVal})
  }

  handleSubmit(event) {
    event.preventDefault();
    let typeObj = {
      date: this.date.current.value,
      task: this.state.task,
      account: this.state.account,
      potential: this.state.points,
      note: this.note.current.value
    };
    if (this.props.defaultMidnight) {
      typeObj._id = this.props.defaultMidnight._id
    }
    if (!(typeObj.potential > 0)) {
      this.setState({numberError: true})
    } else {
      this.setState({saving: true});
      this.props.submit(typeObj).then((valid) => {
        console.log(valid);
        if (valid) {
          this.setState({saving: false, saved: true});
          if (!this.props.defaultMidnight) {
            this.date.current.value = "";
            this.note.current.value = "";
            this.setState({task: "", points: 0, account: ""});
          }
          this.timeout = setTimeout(() => this.setState({saved: false}), 2000)
        }
      })
    }
  }

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  render() {
    return (
      <DialogForm open={this.props.open} close={this.props.close} saved={this.state.saved}
                  saving={this.state.saving} handleSubmit={this.handleSubmit}
                  title={this.props.defaultMidnight ? "Edit Midnight" : "Add Midnight"} >
        <React.Fragment>
          <FormControl fullWidth margin="dense" required>
            <InputLabel shrink>Date</InputLabel>
            <Input inputRef={this.date} type={"date"} placeholder={""}
                   defaultValue={this.props.defaultMidnight ? this.props.defaultMidnight.date.slice(0,10) : ""} required/>
            <FormHelperText>Required</FormHelperText>
          </FormControl>
          <FormControl required fullWidth margin="dense">
            <InputLabel>Task</InputLabel>
            <Select value={this.state.task} onChange={this.taskSelect}
                    autoWidth>
              <MenuItem value="">None</MenuItem>
              { this.props.tasks.map((task) => {
                return <MenuItem value={task._id} key={task._id}>{task.name}</MenuItem>
              })}
            </Select>
            <FormHelperText>Required</FormHelperText>
          </FormControl>
          <FormControl fullWidth margin="dense" error={this.state.numberError}>
            <InputLabel>Point Value</InputLabel>
            <Input value={this.state.points} onChange={(evt) => this.setState({points: evt.target.value})} type="number"
                   required inputProps={{step: 0.1}}/>
            <FormHelperText>Must be positive</FormHelperText>
          </FormControl>
          <FormControl fullWidth margin="dense" required>
            <InputLabel>Zebe</InputLabel>
            <Select value={this.state.account} onChange={(evt) => this.setState({account: evt.target.value})}
                    autoWidth>
              <MenuItem value="">None</MenuItem>
              { this.props.accounts.map((acc) => (
                <MenuItem key={acc._id} value={acc._id}>{acc.zebe.name} ({acc.zebe.kerberos})</MenuItem>
              ))}
            </Select>
            <FormHelperText>Required</FormHelperText>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Additional Notes</InputLabel>
            <Input multiline inputRef={this.note}
                   defaultValue={this.props.defaultMidnight ? this.props.defaultMidnight.note : ""}/>
          </FormControl>
          { this.props.remove ? <FormControl fullWidth margin="dense">
            <Button variant="raised" color="secondary" onClick={this.props.remove}>Delete</Button>
          </FormControl> : null}
        </React.Fragment>
      </DialogForm>
    )
  }
}

MidnightForm.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func,
  submit: PropTypes.func.isRequired,
  defaultMidnight: PropTypes.object,
  accounts: PropTypes.array.isRequired,
  tasks: PropTypes.array.isRequired,
  remove: PropTypes.func
};

export default MidnightForm;