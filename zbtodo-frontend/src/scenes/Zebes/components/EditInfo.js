import React, {Component} from 'react';
import PropTypes from 'prop-types'
import {
  FormControl, Input, InputLabel, FormHelperText
} from '@material-ui/core';
import {DialogForm} from '../../../components';


// TODO: get textmask to work for this
class EditInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phoneError: false,
      saving: false,
      saved: false
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.email = React.createRef();
    this.phone = React.createRef();
  }

  handleSubmit(event) {
    // thank god react sanitizes strings, don't have to worry about that here
    event.preventDefault();
    let newEmail = this.email.current.value;
    // we don't have to validate email bc html does that for us
    let newPhone = this.phone.current.value;
    let isnum = /^\d+$/.test(this.phone.current.value);
    if (newPhone && !isnum) {
      this.setState({phoneError: true})
    } else {
      this.setState({phoneError: false});
      let saveObj = {};
      if (newPhone) saveObj.phone = newPhone;
      if (newEmail) saveObj.email = newEmail;
      this.props.saveInfo(saveObj).then(() => {
        this.setState({saving: false, saved: true});
        this.timeout = setTimeout(()=>{this.setState({saved: false})}, 2000);
      })
      // catch errors higher up- we should never trigger a 400 from the backend, a 500 is a server problem,
      // and a 401 is an auth error that means our token is invalid
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
                  saving={this.state.saving} handleSubmit={this.handleSubmit} title={"Edit Info"}>
        <React.Fragment>
          <FormControl readOnly fullWidth margin="dense">
            <InputLabel>Name</InputLabel>
            <Input value={this.props.name}/>
            <FormHelperText>Contact MIT if you would like this changed.</FormHelperText>
          </FormControl>
          <FormControl readOnly fullWidth margin="dense">
            <InputLabel>Kerberos</InputLabel>
            <Input value={this.props.kerberos}/>
            <FormHelperText>Contact MIT if you would like this changed.</FormHelperText>
          </FormControl>
          <FormControl fullWidth margin="dense" error={this.state.phoneError}>
            <InputLabel>Phone</InputLabel>
            <Input inputRef={this.phone} defaultValue={this.props.oldPhone ? this.props.oldPhone : null}/>
            <FormHelperText>Do not include any symbols.</FormHelperText>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Email</InputLabel>
            <Input inputRef={this.email} type="email"
                   defaultValue={this.props.oldEmail ? this.props.oldEmail : null}/>
          </FormControl>

        </React.Fragment>
      </DialogForm>
    )
  }
}

EditInfo.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  kerberos: PropTypes.string.isRequired,
  oldPhone: PropTypes.string,
  oldEmail: PropTypes.string,
  saveInfo: PropTypes.func.isRequired
};

export default EditInfo;

