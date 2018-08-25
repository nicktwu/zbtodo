import React, {Component} from 'react';
import {ListItem, ListItemIcon, ListItemText, withStyles} from "@material-ui/core";
import PropTypes from 'prop-types';

const styles = (theme) => ({
  active: {
    backgroundColor: theme.palette.secondary.main,
    "&:hover" : {
      backgroundColor: theme.palette.secondary.dark
    }
  }
});

class Nav extends Component {
  render() {
    return (
      <ListItem button className={this.props.active ? this.props.classes.active : null}>
        <ListItemIcon>
          {this.props.icon}
        </ListItemIcon>
        <ListItemText primary={this.props.text} />
      </ListItem>
    )
  }
}

Nav.propTypes = {
  active: PropTypes.bool,
  classes: PropTypes.object.isRequired,
  icon: PropTypes.element.isRequired,
  text: PropTypes.string.isRequired,
};

export default withStyles(styles)(Nav);