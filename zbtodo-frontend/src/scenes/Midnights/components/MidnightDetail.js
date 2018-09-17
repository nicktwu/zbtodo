import React from 'react';
import PropTypes from 'prop-types';
import { TableToolbar } from "../../../components";
import { Dialog, Table, TableBody, TableRow, TableCell, withStyles } from '@material-ui/core';
import Clear from '@material-ui/icons/Clear';

const styles = (theme) => ({
  padded: {
    paddingLeft: theme.spacing.unit*3,
    paddingRight: theme.spacing.unit*3,
    paddingBottom: theme.spacing.unit*3
  }
});

const MidnightDetail = ({open, close, classes, midnight}) => (
  <Dialog open={open} onClose={close}>
    <TableToolbar handleAction={()=>{}} handleClose={close} icon={<Clear />}
                  title={"Midnight Details"} tooltipTitle={""} numSelected={0} />
    <div className={classes.padded}>
      <Table padding="dense">
        <TableBody>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>{midnight ? midnight.task.name : ""}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Assignee</TableCell>
            <TableCell>{midnight ? midnight.account.zebe.name : ""} ({midnight ? midnight.account.zebe.kerberos : ""})</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Point value</TableCell>
            <TableCell>{midnight ? midnight.task.value : ""}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Description</TableCell>
            <TableCell>{midnight ? midnight.task.description : ""}</TableCell>
          </TableRow>
          { midnight.note ?
            <TableRow>
              <TableCell>Special notes</TableCell>
              <TableCell>{ midnight.note }</TableCell>
            </TableRow> : null }
          { midnight.reviewed ?
            <React.Fragment>
              <TableRow>
                <TableCell>Points awarded</TableCell>
                <TableCell>{midnight.awarded}</TableCell>
              </TableRow>
              { midnight.feedback ?
              <TableRow>
                <TableCell>Feedback</TableCell>
                <TableCell>{midnight.feedback}</TableCell>
              </TableRow> : null }
            </React.Fragment> : null
          }
        </TableBody>
     </Table>
    </div>
  </Dialog>
);

let StyledMidnightDetail = withStyles(styles)(MidnightDetail);

StyledMidnightDetail.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func,
  midnight: PropTypes.object
};

export default StyledMidnightDetail