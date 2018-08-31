import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Card, Divider, CardContent,
  Typography, withStyles
} from '@material-ui/core';
import {Person, Input} from '@material-ui/icons';
import {connect} from 'react-redux';
import {Actions} from './services/redux';
import {WithLoader, AdminWrapper} from '../../components';
import { AdvanceSemesterForm } from "./components";

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
    }
  })
};

class Content extends Component {
  constructor(props) {
    super(props);
    this.state = {loading: true};
    this.authHandle = this.authHandle.bind(this);
  }

  componentDidMount() {
    this.props.getHome(this.props.token).catch(() => {
      this.setState({loading: false});
      this.props.timeoutToken();
    }).then(contents => {
      if (contents) {
        this.props.refreshToken(contents.token);
        this.setState({loading: false});
      }
    })
  }

  authHandle(promise) {
    return promise.catch(() => {
      this.props.timeoutToken()
    }).then(contents => {
      if (contents) {
        this.props.refreshToken(contents.token, contents.user ? contents.user : null);
        return contents
      }
    })
  }

  render() {
    let admin = this.props.user.tech_chair || this.props.user.president;
    const advanceSemester = {
      content: <AdvanceSemesterForm checkReady={() => this.authHandle(this.props.checkReady(this.props.token)) }
                                    advance={ (name) => this.authHandle(this.props.advanceSemester(this.props.token, name)) }/>,
      tooltipTitle: "Create new semester and set as current",
      icon: <Input />
    };
    return (
      <WithLoader loading={this.state.loading}>
        <AdminWrapper show={admin} forms={[advanceSemester]}>
        <Grid direction={"column"} alignItems={"stretch"} justify={"center"}
              container className={this.props.classes.gridItemPadded}
              style={{height: "100%"}}>
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
                  { this.props.home.semester ? <Typography variant="caption">
                    {this.props.home.semester.name}
                  </Typography> : null }
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
        </AdminWrapper>
      </WithLoader>
    )
  }
}

Content.propTypes = {
  classes: PropTypes.object.isRequired,
  getHome: PropTypes.func.isRequired,
  home: PropTypes.object.isRequired,
  token: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,
  refreshToken: PropTypes.func.isRequired,
  timeoutToken: PropTypes.func.isRequired,
  checkReady: PropTypes.func.isRequired,
  advanceSemester: PropTypes.func.isRequired
};

const getMapStateToProps = (NAME) => ((state) => ({
  home: state[NAME]
}));

const getMapDispatchToProps = (PREFIX) => ((dispatch) => ({
  getHome: (token) => dispatch(Actions.createGetHome(PREFIX)(token)),
  checkReady: (token) => dispatch(Actions.checkNewSemester(PREFIX)(token)),
  advanceSemester: (token, name) => dispatch(Actions.advanceSemester(PREFIX)(token, name)),
}));

export default (PREFIX, NAME) => connect(getMapStateToProps(NAME), getMapDispatchToProps(PREFIX))(withStyles(styles)(Content));