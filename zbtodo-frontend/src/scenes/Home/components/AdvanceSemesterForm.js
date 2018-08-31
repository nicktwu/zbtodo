import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { DialogForm } from "../../../components";
import { FormControl, Input, InputLabel, FormHelperText } from '@material-ui/core';

class AdvanceSemesterForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      saving: false,
      saved: false,
      notReady: false
    };
    this.name = React.createRef();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({saving: true});
    this.props.checkReady().then((contents) => {
      if (contents && contents.ready) {
        return this.props.advance(this.name.current.value)
      } else if (contents) {
        this.setState({saving: false, notReady: true});
        this.timeout = setTimeout(() => {
          this.setState({notReady: false})
        }, 5000);
        return Promise.resolve({ notSaved: true})
      }
      return Promise.resolve(null)
    }).then(contents => {
      if (contents) {
        if (contents.notSaved) {
          this.setState({saving: false})
        } else {
          this.setState({saving: false, saved: true});
          this.timeout = setTimeout(() => {
            this.setState({saved: false})
          }, 2000);
        }
      }
      // otherwise we errored, let the parent handle it
    })
  }

  render() {
    let {open, close} = this.props;
    return (
      <DialogForm open={open} close={close} saved={this.state.saved} saving={this.state.saving}
                  handleSubmit={this.handleSubmit}
                  title={"New Semester"}>
        <FormControl fullWidth error={this.state.notReady}>
          <InputLabel>Name</InputLabel>
          <Input inputRef={this.name} required/>
          <FormHelperText>{ this.state.notReady ? "Cannot create a new semester right now." : "Enter a name for the new semester" }</FormHelperText>
        </FormControl>
      </DialogForm>
    )
  }
}

AdvanceSemesterForm.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func,
  checkReady: PropTypes.func.isRequired,
  advance: PropTypes.func.isRequired,
};

export default AdvanceSemesterForm;