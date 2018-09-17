import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { TableToolbar } from "../../../components";
import {
  Dialog,
  DialogContentText,
  DialogContent,
  DialogActions,
  Button,
  FormControl, Input, InputLabel
} from '@material-ui/core';
import Clear from '@material-ui/icons/Clear';


class MidnightRequirementForm extends Component {
  constructor(props) {
    super(props);
    this.requirement = React.createRef();
  }

  render() {
    let { open, close, handleSave } = this.props;
    return (
      <Dialog open={open} onClose={close}>
        <TableToolbar handleAction={() => {
        }} handleClose={close} icon={<Clear/>}
                      title={"Set Requirement"} tooltipTitle={""} numSelected={0}/>
        <DialogContent>
          <DialogContentText>
            Any midnight point accounts that do not have a requirement set yet, will have requirement set to this value.
          </DialogContentText>
          <FormControl fullWidth margin="dense">
            <InputLabel>Requirement</InputLabel>
            <Input inputRef={this.requirement} type="number" required />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={() => {
            close();
            handleSave(this.requirement.current.value);
          }}>Set Requirement</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

MidnightRequirementForm.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func,
  handleSave: PropTypes.func.isRequired
};

export default MidnightRequirementForm