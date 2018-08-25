import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles, CircularProgress, Dialog, DialogTitle, DialogActions, DialogContent } from '@material-ui/core';
import {Redirect} from "react-router-dom";


const styles = theme => ({
  progress: {
    margin: theme.spacing.unit * 2,
  },
  centered: {
    marginRight: "auto",
    marginLeft: "auto"
  }
});

class FinishAuthorizationContent extends Component {
  render() {
    return (
      <Dialog open={true}>
        <DialogTitle>Finishing login, please wait...</DialogTitle>
        <DialogContent className={this.props.classes.centered}>
            <CircularProgress className={this.props.classes.progress} size={this.props.size}
                              color={this.props.color} thickness={this.props.thickness} />
        </DialogContent>
        <DialogActions/>
      </Dialog>
    )
  }
}

FinishAuthorizationContent.propTypes = {
  classes: PropTypes.object.isRequired,
  size: PropTypes.number.isRequired,
  color: PropTypes.string,
  thickness: PropTypes.number
};

const FinishAuthorization = withStyles(styles)(FinishAuthorizationContent);

class FinishAuthorizationWrapper extends Component {

  componentDidMount() {
    if (this.props.queryParams.code && this.props.queryParams.state) {
      this.props.finishLogin(this.props.queryParams.code, this.props.queryParams.state);
    }
  }

  render() {
    let params = this.props.queryParams;
    if (!params || !params.code || !params.state) {
      return <Redirect to={this.props.loginPath} />
    }
    if (this.props.token) {
      return <Redirect to={this.props.finishPath} />
    }
    if (this.props.errMessage) {
      return <Redirect to={this.props.loginPath} />
    }
    return (
      <FinishAuthorization size={100}/>
    )
  }
}

FinishAuthorizationWrapper.propTypes = {
  token: PropTypes.string,
  errMessage: PropTypes.string,
  finishLogin: PropTypes.func.isRequired,
  finishPath: PropTypes.string.isRequired,
  loginPath: PropTypes.string.isRequired,
  queryParams: PropTypes.object.isRequired
};

export default FinishAuthorizationWrapper;
