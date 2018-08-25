import React, {Component} from 'react';
import {Redirect, withRouter} from 'react-router-dom';
import {Paper,DialogTitle, DialogActions, DialogContent, DialogContentText, Dialog, Button, withStyles, Typography, Avatar} from "@material-ui/core";
import LockIcon from '@material-ui/icons/LockOutlined';
import PropTypes from 'prop-types';

const styles = (theme) => ({
  loginContainer: {
    width: 'auto',
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
      width: 400,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  loginPaper: {
    marginTop: theme.spacing.unit * 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
  },
  loginAvatar: {
    margin: theme.spacing.unit,
    backgroundColor: theme.palette.secondary.main,
  },
});


class Login extends Component {
  // TODO: Implement loading spinner after login click

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
    this.initiateLogin = this.initiateLogin.bind(this);
  }

  initiateLogin() {
    this.setState({loading: true});
    this.props.click();
  }

  static getDerivedStateFromProps(props, state) {
    let newState = {...state};
    if (!!props.errMessage) {
      newState.lastMessage = props.errMessage;
    }
    return newState

  }

  render() {
    if (this.props.token) {
      return <Redirect to={this.props.finishPath}/>
    }
    return (
      <div className={this.props.classes.loginContainer}>
        <Dialog open={!!this.props.errMessage} onClose={this.props.clearMessage}>
          <DialogTitle>
            Error
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              { this.props.errMessage || this.state.lastMessage /* this stupid hack is to keep the message intact as the dialog fades */}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.props.clearMessage} color="secondary">Close</Button>
          </DialogActions>
        </Dialog>
        <Paper className={this.props.classes.loginPaper}>
          <Avatar className={this.props.classes.loginAvatar}>
            <LockIcon/>
          </Avatar>
          <Typography variant="headline" gutterBottom>You are not signed in.</Typography>
          <Typography gutterBottom paragraph>Click below to login with MIT credentials.</Typography>
          <Button color="primary" variant="raised" fullWidth disabled={this.props.loading}
                  onClick={this.initiateLogin}>Login</Button>
        </Paper>
      </div>
    )
  }
}

Login.propTypes = {
  click: PropTypes.func.isRequired,
  token: PropTypes.string,
  errMessage: PropTypes.string,
  finishPath: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
  clearMessage: PropTypes.func.isRequired
};

export default withRouter(withStyles(styles)(Login));