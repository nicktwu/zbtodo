import React from 'react';
import PropTypes from 'prop-types';
import {
  Table, TableHead, TableRow, TableCell, TableBody, Typography,
  Tooltip, IconButton, withStyles
} from "@material-ui/core";
import classNames from 'classnames';
import CreateOutlined from '@material-ui/icons/CreateOutlined';
import VerifiedUser from '@material-ui/icons/VerifiedUser';
import { lightGreen } from '@material-ui/core/colors';

const styles = (theme) => ({
  hoverClick: {
    cursor: "pointer"
  },
  goodRow: {
    backgroundColor: lightGreen[900],
    "&:hover": {
      backgroundColor: lightGreen[800]
    }
  },
  badRow: {
    backgroundColor: theme.palette.error.main,
    "&:hover": {
      backgroundColor: theme.palette.error.dark,
    },
  },
  highlightedRow: {
    backgroundColor: theme.palette.secondary.main,
    "&:hover": {
      backgroundColor: theme.palette.secondary.dark
    }
  },
  normalRow: {
    "&:hover": {
      backgroundColor: theme.palette.background.default
    }
  },
  exceptionalText: {
    marginTop: theme.spacing.unit*2
  }
});

const MidnightsTable = ({ midnights, classes, userId, handleClick, admin, handleAward }) => {
  if (midnights.length) {
    return (
      <React.Fragment>
        <Table padding={"checkbox"}>
          <TableHead>
            <TableRow>
              <TableCell>Midnight Name</TableCell>
              <TableCell>Zebe</TableCell>
              <TableCell>Points</TableCell>
              {admin ? <React.Fragment>
                <TableCell>Edit/Delete</TableCell>
                <TableCell>Award Points</TableCell>
              </React.Fragment> : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {midnights.map((midnight, idx) => {
              let reviewed = midnight.reviewed;
              let goodJob = reviewed ? midnight.awarded >= midnight.potential : false;
              let userMidnight = midnight.account.zebe._id === userId;
              let rowClass = classNames(
                reviewed ? goodJob ? classes.goodRow : classes.badRow : userMidnight ? classes.highlightedRow : classes.normalRow,
                admin ? null : classes.hoverClick
              );
              return (
                <Tooltip key={idx} title={reviewed ? goodJob ? "This midnight was done well!" : "This midnight was not awarded full points." : "This midnight has not been reviewed yet." }>
                  <TableRow onClick={admin ? () => {
                  } : handleClick(idx)}
                            className={rowClass}>
                    <TableCell>{midnight.task.name}</TableCell>
                    <TableCell>{midnight.account.zebe.kerberos}</TableCell>
                    <TableCell>{reviewed ? midnight.awarded : midnight.potential.toString() + "*"}</TableCell>
                    {admin ? <React.Fragment>
                      <TableCell><IconButton onClick={handleClick(idx)}><CreateOutlined/></IconButton></TableCell>
                      <TableCell><IconButton onClick={handleAward(idx)}><VerifiedUser/></IconButton></TableCell>
                    </React.Fragment> : null}
                  </TableRow>
                </Tooltip>
              )
            })}
          </TableBody>
        </Table>
        <Typography variant={"caption"} className={classes.exceptionalText}>
          * denotes potential points, assuming satisfactory completion
        </Typography>
      </React.Fragment>
    )
  } else {
    return <Typography variant={"body1"} className={classes.exceptionalText}>No midnights to show!</Typography>
  }
};

MidnightsTable.propTypes = {
  admin: PropTypes.bool,
  midnights: PropTypes.array.isRequired,
  userId: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
  handleClick: PropTypes.func.isRequired,
  handleAward: PropTypes.func,
};

export default withStyles(styles)(MidnightsTable)