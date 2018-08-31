import React from 'react';
import PropTypes from 'prop-types'
import {
  Dialog, DialogContent, FormControl, Button,
  withStyles
} from '@material-ui/core';
import {Clear} from '@material-ui/icons';
import { green } from '@material-ui/core/colors';
import TableToolbar from "./TableToolbar";

const styles = (theme) => ({
  savedButton: {
    backgroundColor: green[700],
    "&:hover" : {
      backgroundColor: green[600]
    }
  }
});

const DialogForm = ({open, close, title, children, handleSubmit, classes, saved, saving}) => (
  <Dialog open={open} onClose={close}>
    <TableToolbar handleAction={()=>{}} handleClose={close} icon={<Clear />}
                  title={title} tooltipTitle={""} numSelected={0} />
    <DialogContent>
      <form onSubmit={handleSubmit}>
        {children}
        <FormControl margin="normal" fullWidth>
          {/* TODO: make this switch to a loader when saving */}
          <Button variant="raised" type={"submit"} color={"primary"}
                  className={saved ? classes.savedButton : null}
                  fullWidth disabled={saving}>
            {saved ? "Saved" : saving ? "Saving" : "Save"}
          </Button>
        </FormControl>
      </form>
    </DialogContent>
  </Dialog>
);

DialogForm.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func.isRequired,
  saved: PropTypes.bool,
  saving: PropTypes.bool,
  classes: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired
};

export default withStyles(styles)(DialogForm);

