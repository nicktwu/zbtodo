import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  FormControl, InputLabel, Input, FormHelperText
} from '@material-ui/core';
import { DialogForm } from "../../../components";

class AccountForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      saved: false,
      saving: false,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.balance = React.createRef();
    this.requirement = React.createRef();
  }

  handleSubmit(event) {
    event.preventDefault();
    let accountObj = {
      _id: this.props.defaultAccount._id,
      zebe: this.props.defaultAccount.zebe,
      balance: this.balance.current.value,
      requirement: this.requirement.current.value
    };
    this.setState({saving: true});
    this.props.submit(accountObj).then((valid) => {
      if (valid) {
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
    return (
      <DialogForm open={this.props.open} close={this.props.close} saved={this.state.saved}
                  saving={this.state.saving} handleSubmit={this.handleSubmit}
                  title={"Edit Midnight Account"} >
        <React.Fragment>
          <FormControl readOnly fullWidth margin="dense">
            <InputLabel>Name</InputLabel>
            <Input value={this.props.defaultAccount.zebe.name}/>
            <FormHelperText>Contact MIT if you would like this changed.</FormHelperText>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Points</InputLabel>
            <Input type={"number"} inputRef={this.balance} inputProps={{step: "any"}}
                   defaultValue={this.props.defaultAccount.balance}/>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Requirement</InputLabel>
            <Input type={"number"} inputRef={this.requirement}
                   defaultValue={this.props.defaultAccount.requirement}/>
          </FormControl>
        </React.Fragment>
      </DialogForm>
    )
  }
}

AccountForm.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func,
  submit: PropTypes.func.isRequired,
  defaultAccount: PropTypes.object.isRequired
};

export default AccountForm;