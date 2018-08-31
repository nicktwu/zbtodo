import React from 'react';
import {
  withStyles, Tooltip, IconButton, Typography, Toolbar
} from '@material-ui/core';
import {lightGreen} from '@material-ui/core/colors';
import PropTypes from 'prop-types';
import {Clear} from '@material-ui/icons';


const toolbarStyles = (theme) => ({
  title: {
    flex: "0 0 auto"
  },
  highlight: {
    color: theme.palette.text.primary,
    backgroundColor: lightGreen[800],
    paddingRight: theme.spacing.unit
  },
  highlightRed: {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.secondary.light,
    paddingRight: theme.spacing.unit
  },
  spacer: {
    flex: "1 1 100%"
  },
  actions: {
    color: theme.palette.text.secondary
  },
  saved: {
    color: theme.palette.text.primary,
    backgroundColor: lightGreen[900]
  },
  savedRed: {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.secondary.dark
  }
});

const TableToolbar  = ({ classes, red, icon, title, handleClose, tooltipTitle, numSelected, saved, handleAction }) => (
  <Toolbar className={saved ? red ? classes.savedRed : classes.saved : numSelected > 0 ? red ? classes.highlightRed : classes.highlight : null}>
    <div className={classes.title}>
      { saved ? (
        <Typography color="inherit" variant="subheading">
          Saved
        </Typography>
      ) : (numSelected > 0 ? (
        <Typography color="inherit" variant="subheading">
          {numSelected.toString()} selected
        </Typography>
      ) : (
        <Typography variant="title">
          { title }
        </Typography>
      )) }
      </div>
    <div className={classes.spacer} />
    <div className={classes.actions}>
      { !saved && numSelected > 0 ? <Tooltip title={tooltipTitle} placement="left">
        <IconButton onClick={handleAction}>
          { icon }
        </IconButton>
      </Tooltip> : <Tooltip title={"Close"} placement={"left"}>
        <IconButton onClick={handleClose}><Clear /></IconButton>
      </Tooltip> }
      </div>
  </Toolbar>
);

TableToolbar.propTypes = {
  red: PropTypes.bool,
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  handleAction: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  tooltipTitle: PropTypes.string.isRequired,
  saved: PropTypes.bool,
  icon: PropTypes.node.isRequired
};

export default withStyles(toolbarStyles)(TableToolbar);