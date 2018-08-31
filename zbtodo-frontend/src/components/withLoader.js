import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, CircularProgress, Fade, withStyles} from '@material-ui/core'

const styles = (theme) => ({
  loader: {

  }
});

class withLoader extends Component {
  render() {
    return (
      <React.Fragment>
        <Dialog open={this.props.loading}>
          <DialogTitle>Loading</DialogTitle>
          <DialogContent>
            <CircularProgress className={this.props.classes.loader}/>
          </DialogContent>
        </Dialog>
        <Fade in={!this.props.loading}>
          { this.props.children }
        </Fade>
      </React.Fragment>
    )
  }
}

withLoader.propTypes = {
  loading: PropTypes.bool,
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(withLoader);