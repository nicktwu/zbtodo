import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  FormControl, InputLabel, Input, FormHelperText
} from '@material-ui/core';
import { DialogForm } from "../../../components";

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
  }

  handleSubmit(event) {
    event.preventDefault();
    let typeObj = {
      name: this.name.current.value,
      value: this.pointValue.current.value,
      description: this.description.current.value
    };
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