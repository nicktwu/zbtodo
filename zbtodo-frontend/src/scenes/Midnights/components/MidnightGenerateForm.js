import React from 'react';
import PropTypes from 'prop-types';
import { TableToolbar } from "../../../components";
import { Dialog, DialogContentText, DialogContent, DialogActions, Button } from '@material-ui/core';
import Clear from '@material-ui/icons/Clear';


const MidnightGenerateForm = ({open, close, handleGenerate}) => (
  <Dialog open={open} onClose={close}>
    <TableToolbar handleAction={()=>{}} handleClose={close} icon={<Clear />}
                  title={"Generate Midnights"} tooltipTitle={""} numSelected={0} />
    <DialogContent>
      <DialogContentText>
        This will create a new batch of midnights using the algorithm, based on the point counts. This action is tedious to reverse, and should only be done once a week.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      {/*<Button>Generate unassigned (beta feature)</Button>*/}
      <Button onClick={() => {close(); handleGenerate();}}>Generate and assign</Button>
    </DialogActions>
  </Dialog>
);

MidnightGenerateForm.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func,
  handleGenerate: PropTypes.func.isRequired
};

export default MidnightGenerateForm