import React from 'react';
import { SpeedDial, SpeedDialIcon } from '@material-ui/lab';
import {CreateOutlined, Clear} from '@material-ui/icons';
import { withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';

const styles = (theme) => ({
  speedDial: {
    position: "fixed",
    bottom: theme.spacing.unit*3,
    right: theme.spacing.unit*3
  }
});

const AdminButtonSet = ({ classes, open, onClose, onOpen, children, hidden}) => (
  <SpeedDial className={classes.speedDial} open={open}
             ariaLabel="Admin settings" ButtonProps={{color: "secondary"}}
             hidden={hidden} onBlur={onClose} direction={"left"}
             onClick={open ? onClose : onOpen}
             onClose={onClose} onFocus={onOpen}
             onMouseEnter={onOpen} onMouseLeave={onClose}
             icon={<SpeedDialIcon icon={<CreateOutlined />} openIcon={<Clear />}/>}>
    {children}
    </SpeedDial>);

AdminButtonSet.propTypes = {
  classes: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool,
  onOpen: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  hidden: PropTypes.bool.isRequired
};

export default withStyles(styles)(AdminButtonSet);