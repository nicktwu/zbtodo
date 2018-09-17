import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  FormControl, InputLabel, Input, FormHelperText, Divider
} from '@material-ui/core';
import { DialogForm } from "../../../components";

const DAYS_OF_WEEK= [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

class TypeForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      numberError: false,
      saved: false,
      saving: false,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.name = React.createRef();
    this.pointValue = React.createRef();
    this.description = React.createRef();
    this.defaultDays = DAYS_OF_WEEK.map(() => React.createRef());
  }

  handleSubmit(event) {
    event.preventDefault();
    let typeObj = {
      name: this.name.current.value,
      value: this.pointValue.current.value,
      description: this.description.current.value,
      defaultDays: this.defaultDays.map((ref) => (ref.current.value))
    };
    if (this.props.defaultType) {
      typeObj._id = this.props.defaultType._id;
    }
    if (!(typeObj.value > 0)) {
      this.setState({numberError: true})
    } else {
      this.setState({saving: true});
      this.props.submit(typeObj).then((valid) => {
        if (valid) {
          this.setState({saving: false, saved: true});
          if (!this.props.defaultType) {
            this.name.current.value = "";
            this.pointValue.current.value = 0;
            this.description.current.value = "";
            for (let i = 0; i < DAYS_OF_WEEK.length; i++) {
              this.defaultDays[i].current.value = 0;
            }
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
                  title={this.props.defaultType ? "Edit Midnight Type" : "Add Midnight Type"} >
        <React.Fragment>
          <FormControl fullWidth margin="dense">
            <InputLabel>Name</InputLabel>
            <Input inputRef={this.name} defaultValue={this.props.defaultType ? this.props.defaultType.name : ""} required/>
            <FormHelperText>Eg. Bathrooms, Commons, etc.</FormHelperText>
          </FormControl>
          <FormControl fullWidth margin="dense" error={this.state.numberError}>
            <InputLabel>Default Point Value</InputLabel>
            <Input inputRef={this.pointValue} type="number"
                   defaultValue={this.props.defaultType ? this.props.defaultType.value : 0} required/>
            <FormHelperText>Must be positive</FormHelperText>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Description</InputLabel>
            <Input inputRef={this.description} multiline required
                   defaultValue={this.props.defaultType ? this.props.defaultType.description : ""}
                   placeholder="Enter description here..."/>
          </FormControl>
          <Divider />
            { DAYS_OF_WEEK.map((day, idx) => (
              <FormControl key={idx} margin="dense" style={{width: "70px"}}>
                <InputLabel>{day}</InputLabel>
                <Input inputRef={this.defaultDays[idx]} required
                       defaultValue={this.props.defaultType ? this.props.defaultType.defaultDays[idx] : 0}/>
              </FormControl>
            ))}
        </React.Fragment>
      </DialogForm>
    )
  }
}

TypeForm.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func,
  submit: PropTypes.func.isRequired,
  defaultType: PropTypes.object
};

export default TypeForm;