import React, {Component} from 'react';
import PropTypes from 'prop-types'
import {
  FormControl, FormGroup, FormControlLabel, Checkbox,
  Input, InputLabel, FormHelperText
} from '@material-ui/core';
import {DialogForm} from '../../../components';

const ZEBE_PERMISSIONS = [
  { name: "president", format: "President"},
  { name: "midnight_maker", format: "Midnight Maker"},
  { name: "house_chair", format: "House Chair"},
  { name: "workweek_chair", format: "Workweek Chair"},
  { name: "dev", format: "Developer"},
  { name: "rush_chair", format: "Rush Chair"},
  { name: "tech_chair", format: "Tech Chair"},
  { name: "social_chair", format: "Social Chair"},
  { name: "risk_manager", format: "Risk Manager"}
];


// TODO: get textmask to work for this
class EditPermissions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phoneError: false,
      saving: false,
      saved: false
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.inputReferences = {};
    for (let idx in ZEBE_PERMISSIONS) {
      let perm = ZEBE_PERMISSIONS[idx];
      this.inputReferences[perm.name] = React.createRef();
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    let permissionData = {};
    for (let idx in Object.keys(this.inputReferences)) {
      let key = Object.keys(this.inputReferences)[idx];
      permissionData[key] = this.inputReferences[key].current.checked
    }
    this.setState({saving: true});
    this.props.savePermissions({ id: this.props.zebe._id, permissions: permissionData}).then((contents) => {
      if (contents) {
        this.setState({saving: false, saved: true});
        this.timeout = setTimeout(()=>{this.setState({saved: false})}, 2000);
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
                  saving={this.state.saving} handleSubmit={this.handleSubmit} title={"Edit Permissions"}>
        <React.Fragment>
          <FormControl readOnly fullWidth margin="dense">
            <InputLabel>Name</InputLabel>
            <Input value={this.props.zebe.name}/>
            <FormHelperText>Contact MIT if you would like this changed.</FormHelperText>
          </FormControl>
          <FormControl readOnly fullWidth margin="dense">
            <InputLabel>Kerberos</InputLabel>
            <Input value={this.props.zebe.kerberos}/>
            <FormHelperText>Contact MIT if you would like this changed.</FormHelperText>
          </FormControl>
          <FormControl>
            <FormGroup>
              {ZEBE_PERMISSIONS.map((perm, idx) => {
                return (
                  <FormControlLabel key={idx} control={
                    <Checkbox inputRef={this.inputReferences[perm.name]}
                              defaultChecked={this.props.zebe[perm.name]}
                              value={perm.name}/>
                  } label={perm.format}/>
                )
              })}
            </FormGroup>
          </FormControl>
        </React.Fragment>
      </DialogForm>
    )
  }
}

EditPermissions.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func.isRequired,
  zebe: PropTypes.object.isRequired,
  savePermissions: PropTypes.func.isRequired
};

export default EditPermissions;

