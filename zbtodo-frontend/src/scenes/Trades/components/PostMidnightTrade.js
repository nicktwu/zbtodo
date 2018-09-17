import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {
  FormControl, InputLabel, Input, FormHelperText, Select, MenuItem, Button,
  FormControlLabel, Checkbox
} from '@material-ui/core';
import { DialogForm } from "../../../components";

class PostMidnightTrade extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      numberError: false,
      saved: false,
      saving: false,
      midnight: "",
      emailOut: false
    };
    this.points = React.createRef();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.midnightSelect = this.midnightSelect.bind(this);
    this.close = this.close.bind(this);
  }

  close() {
    this.setState({open: false})
  }

  midnightSelect(event) {
    let taskId = event.target.value;
    this.setState({midnight: taskId})
  }

  handleSubmit(event) {
    event.preventDefault();
    let typeObj = {
      midnight: this.state.midnight,
      pointsOffered: this.points.current.value,
      email: this.state.emailOut
    };
    if (typeObj.pointsOffered < 0) {
      this.setState({numberError: true})
    } else {
      this.setState({saving: true});
      this.props.submit(typeObj).then((valid) => {
        if (valid) {
          this.setState({saving: false, saved: true, numberError: false, midnight: "", emailOut: false});
          this.points.current.value = 0;
          this.setState({midnight: ""});
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
      <Fragment>
        <Button variant={"outlined"} onClick={()=>this.setState({open: true})}>Give Away Midnight</Button>
        <DialogForm open={this.state.open} close={this.close} saved={this.state.saved}
                    saving={this.state.saving} handleSubmit={this.handleSubmit}
                    title={"Post Midnight Trade"}>
          <Fragment>
            <FormControl required fullWidth margin="dense">
              <InputLabel>Midnight</InputLabel>
              <Select value={this.state.midnight} onChange={this.midnightSelect}
                      autoWidth>
                <MenuItem value="">None</MenuItem>
                {this.props.midnights.map((midnight) => {
                  return <MenuItem value={midnight._id} key={midnight._id}>
                    {midnight.date.substr(0, 10)}: {midnight.task.name}
                    </MenuItem>
                })}
              </Select>
              <FormHelperText>Required</FormHelperText>
            </FormControl>
            <FormControl fullWidth margin="dense" error={this.state.numberError}>
              <InputLabel>Additional Points To Offer</InputLabel>
              <Input inputRef={this.points} type="number" required
                     defaultValue={0}/>
              <FormHelperText>Must be nonnegative</FormHelperText>
            </FormControl>
            <FormControlLabel control={
              <Checkbox checked={this.state.emailOut} onChange={(evt)=>this.setState({emailOut: evt.target.checked})}/>
            } label={"Email out to all residents"}/>
          </Fragment>
        </DialogForm>
      </Fragment>
    )
  }
}

PostMidnightTrade.propTypes = {
  submit: PropTypes.func.isRequired,
  midnights: PropTypes.array.isRequired
};

export default PostMidnightTrade;