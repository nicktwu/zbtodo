import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Card, Divider, Fade, CardContent,
  Dialog, DialogTitle, DialogContent,
  CircularProgress, Typography, withStyles
} from '@material-ui/core';
import {Person} from '@material-ui/icons';
import {connect} from 'react-redux';
import {Actions} from './services/redux';

const userIconSize = 32;

const styles = theme => {
  return ({
    userIconCard: {
      borderRadius: "50%",
      height: userIconSize * 2,
      width: userIconSize * 2,
      color: theme.palette.primary.light,
      fontSize: userIconSize,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    overviewCard: {
      flexGrow: 1,
      height: "50vh",
    },
    flex: {
      flexGrow: 1
    },
    cardDivider: {
      marginBottom: theme.spacing.unit*2
    },
    gridItemPadded: {
      padding: theme.spacing.unit
    },
    loader: {
      left: "auto",
      right: "auto"
    }
  })
};

class Content extends Component {
  constructor(props) {
    super(props);
    this.state = {loading: false}
  }

  componentDidMount() {
    this.setState({loading: true});
    this.props.getCurrentUser(this.props.token).catch(() => {
      this.setState({loading: false});
      this.props.timeoutToken();
    }).then(contents => {
      if (contents) {
        this.props.refreshToken(contents.token);
        this.setState({loading: false});
      }
    })
  }

  render() {
    return (
      <React.Fragment>
        <Dialog open={this.state.loading}>
          <DialogTitle>Loading</DialogTitle>
          <DialogContent>
            <CircularProgress className={this.props.classes.loader}/>
          </DialogContent>
        </Dialog>
        <Fade in={!this.state.loading}>
          <Grid direction={"column"} alignItems={"stretch"} justify={"center"}
                container className={this.props.classes.gridItemPadded}
                style={{marginTop: "auto", marginBottom: "auto"}}>
            <Grid item>
              <Grid container direction={"row"} alignItems={"center"}>
                <Grid xs={12} md={4} item>
                  <Grid container direction={"column"} justify={"center"}
                        alignItems={"center"} className={this.props.classes.gridItemPadded}>
                    <Grid item className={this.props.classes.gridItemPadded}>
                      <Card raised className={this.props.classes.userIconCard}>
                        <Person fontSize={"inherit"}/>
                      </Card>
                    </Grid>
                    <Grid item className={this.props.classes.gridItemPadded}>
                      <Typography variant="headline">
                        {this.props.home.user.name}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid xs={12} md={7} item className={this.props.classes.gridItemPadded}>
                  <Card raised className={this.props.classes.overviewCard}>
                    <CardContent>
                      <Typography variant="headline" gutterBottom>
                        Overview
                      </Typography>
                      <Divider className={this.props.classes.cardDivider}/>
                      <Typography variant="body1">
                        {this.props.home.user.zebe ? "Nothing to do!" : "Your account has not been verified. Please contact the tech chair or president."}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fade>
      </React.Fragment>
    )
  }
}

Content.propTypes = {
  classes: PropTypes.object.isRequired,
  getCurrentUser: PropTypes.func.isRequired,
  home: PropTypes.object.isRequired,
  token: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,
  refreshToken: PropTypes.func.isRequired,
  timeoutToken: PropTypes.func.isRequired
};

const getMapStateToProps = (NAME) => ((state) => ({
  home: state[NAME]
}));

const getMapDispatchToProps = (PREFIX) => ((dispatch) => ({
  getCurrentUser: (token) => dispatch(Actions.createGetCurrentUser(PREFIX)(token))
}));

export default (PREFIX, NAME) => connect(getMapStateToProps(NAME), getMapDispatchToProps(PREFIX))(withStyles(styles)(Content));