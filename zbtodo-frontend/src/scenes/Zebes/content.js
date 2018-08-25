import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  Fade,
  Grid,
  Paper,
  Dialog, DialogContent, DialogTitle, CircularProgress,
  Table, TableHead, TableBody, TableRow, TableCell,
  withStyles,
  Button, IconButton
} from '@material-ui/core';
import { connect } from 'react-redux';
import { Actions } from './services/redux';
import { EditInfo, AddZebes, DeactivateZebes, ReactivateZebes, DeleteUsers, EditPermissions } from './components';
import { EditOutlined } from '@material-ui/icons';

const styles = theme => {
  return ({
    contentContainer: {
      padding: theme.spacing.unit*3,
      flexWrap: "nowrap"
    },
    adminContainer: {
      textAlign: "center"
    },
    adminButton: {
      marginLeft: theme.spacing.unit,
      marginBottom: theme.spacing.unit
    },
    tableContainer: {
      overflowX: "auto"
    },
  })
};

class Content extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      editInfo: false,
      addZebe: false,
      deactivateZebes: false,
      reactivateZebes: false,
      deleteUsers: false,
      editPermissions: false,
      editIndex: 0
    };
    this.closeEditPermissions = this.closeEditPermissions.bind(this);
    this.openEditPermissions = this.openEditPermissions.bind(this);
    this.saveEditPermissions = this.saveEditPermissions.bind(this);

    this.closeEditInfo = this.closeEditInfo.bind(this);
    this.openEditInfo = this.openEditInfo.bind(this);
    this.saveEditInfo = this.saveEditInfo.bind(this);

    this.closeAddZebe = this.closeAddZebe.bind(this);
    this.openAddZebe = this.openAddZebe.bind(this);
    this.saveAddZebe = this.saveAddZebe.bind(this);

    this.closeDeactivateZebes = this.closeDeactivateZebes.bind(this);
    this.openDeactivateZebes = this.openDeactivateZebes.bind(this);
    this.saveDeactivateZebes = this.saveDeactivateZebes.bind(this);

    this.closeReactivateZebes = this.closeReactivateZebes.bind(this);
    this.openReactivateZebes = this.openReactivateZebes.bind(this);
    this.saveReactivateZebes = this.saveReactivateZebes.bind(this);

    this.closeDeleteUsers = this.closeDeleteUsers.bind(this);
    this.openDeleteUsers = this.openDeleteUsers.bind(this);
    this.saveDeleteUsers = this.saveDeleteUsers.bind(this);
  }

  openDeleteUsers() {
    this.setState({deleteUsers: true})
  }

  closeDeleteUsers() {
    this.setState({deleteUsers: false})
  }

  saveDeleteUsers(idArray) {
    return this.props.deleteUsers(this.props.token, idArray).catch(() => {
      this.props.timeoutToken()
    }).then(contents => {
      if (contents) {
        this.props.refreshToken(contents.token);
        return contents
      }
    })
  }

  openReactivateZebes() {
    this.setState({reactivateZebes: true})
  }

  closeReactivateZebes() {
    this.setState({reactivateZebes: false})
  }

  saveReactivateZebes(idArray) {
    return this.props.reactivateZebes(this.props.token, idArray).catch(() => {
      this.props.timeoutToken()
    }).then(contents => {
      if (contents) {
        this.props.refreshToken(contents.token);
        return contents
      }
    })
  }

  openDeactivateZebes() {
    this.setState({deactivateZebes: true})
  }

  closeDeactivateZebes() {
    this.setState({deactivateZebes: false})
  }

  saveDeactivateZebes(idArray) {
    return this.props.deactivateZebes(this.props.token, idArray).catch(() => {
      this.props.timeoutToken()
    }).then(contents => {
      if (contents) {
        this.props.refreshToken(contents.token);
        return contents
      }
    })
  }

  openAddZebe() {
    this.setState({addZebe: true})
  }

  closeAddZebe() {
    this.setState({addZebe: false})
  }

  saveAddZebe(idArray) {
    return this.props.validateZebes(this.props.token, idArray).catch(() => {
      this.props.timeoutToken()
    }).then(contents => {
      if (contents) {
        this.props.refreshToken(contents.token);
        return contents
      }
    })
  }

  openEditInfo() {
    this.setState({editInfo: true});
  }

  closeEditInfo() {
    this.setState({editInfo: false, loading: true});
    this.props.getCurrentZebes(this.props.token).catch(() => {
      this.props.timeoutToken()
    }).then(contents => {
      if (contents) {
        this.props.refreshToken(contents.token);
        this.setState({loading: false});
      }
    })
  }

  saveEditInfo(saveObj) {
    return this.props.saveUserInfo(this.props.token, saveObj).catch(() => {
      this.props.timeoutToken();
    }).then(contents => {
      if (contents) {
        this.props.refreshToken(contents.token, contents.user);
        return contents
      }
    })
  }

  openEditPermissions(idx) {
    return () => this.setState({editPermissions: true, editIndex: idx})
  }

  closeEditPermissions() {
    this.setState({editPermissions: false})
  }

  saveEditPermissions(permissions) {
    return this.props.saveEditPermissions(this.props.token, permissions).catch(() => {
      this.props.timeoutToken();
    }).then(contents => {
      if (contents) {
        this.props.refreshToken(contents.token);
        return contents
      }
    })
  }

  componentDidMount() {
    this.setState({loading: true});
    const admin = this.props.user.tech_chair || this.props.user.rush_chair || this.props.user.president;
    if (admin) {
      this.props.getAdminInfo(this.props.token).catch((err) => {
        console.log(err);
        this.props.timeoutToken();
      }).then(contents => {
        if (contents) {
          this.props.refreshToken(contents.token);
          this.setState({loading: false});
        }
      })
    } else {
      this.props.getCurrentZebes(this.props.token).catch(() => {
        this.props.timeoutToken();
      }).then(contents => {
        if (contents) {
          this.props.refreshToken(contents.token);
          this.setState({loading: false});
        }
      })
    }
  }

  render() {
    const admin = this.props.user.tech_chair || this.props.user.rush_chair || this.props.user.president;
    /*const potZebeHash = this.props.potentialZebes ? hashFunction(this.props.potentialZebes) : "";
    const currentZebeHash = hashFunction(this.props.currentZebes);
    const inactiveZebeHash = this.props.inactiveZebes ? hashFunction(this.props.inactiveZebes) : "";
    const uselessZebeHash = this.props.inactive && this.props.potentialZebes ?
      hashFunction(this.props.inactiveZebes.concat(this.props.potentialZebes)) : ""; */
    return (
      <React.Fragment>
        <Dialog open={this.state.loading}>
          <DialogTitle>Loading</DialogTitle>
          <DialogContent>
            <CircularProgress className={this.props.classes.loader}/>
          </DialogContent>
        </Dialog>
        <EditInfo name={this.props.user.name}
                  kerberos={this.props.user.kerberos}
                  open={this.state.editInfo}
                  close={this.closeEditInfo}
                  oldPhone={this.props.user.phone}
                  oldEmail={this.props.user.email} saveInfo={this.saveEditInfo}/>
        { admin ? <React.Fragment>
          <AddZebes open={this.state.addZebe} close={this.closeAddZebe}
                    handleApprove={this.saveAddZebe} personList={this.props.potentialZebes || []}/>
          <DeactivateZebes open={this.state.deactivateZebes} close={this.closeDeactivateZebes}
                           handleDeactivate={this.saveDeactivateZebes} personList={this.props.currentZebes || []}/>
          <ReactivateZebes open={this.state.reactivateZebes} close={this.closeReactivateZebes}
                           handleReactivate={this.saveReactivateZebes} personList={this.props.inactiveZebes || []}/>
          <DeleteUsers open={this.state.deleteUsers} close={this.closeDeleteUsers}
                       handleDelete={this.saveDeleteUsers}
                       personList={(this.props.potentialZebes && this.props.inactiveZebes) ?
                         this.props.potentialZebes.concat(this.props.inactiveZebes) : []}/>
          <EditPermissions zebe={this.props.currentZebes[this.state.editIndex]}
                           open={this.state.editPermissions}
                           close={this.closeEditPermissions} savePermissions={this.saveEditPermissions}/>
        </React.Fragment> : null}
        <Fade in={!this.state.loading}>
          <Grid direction={"column"} alignItems={"center"} justify={"center"} container
                className={this.props.classes.contentContainer} spacing={16}>
            <Grid item>
              <Button variant="outlined" color="primary" onClick={this.openEditInfo}>Edit My Info</Button>
            </Grid>
            { admin ? <Grid item className={this.props.classes.adminContainer}>
              <Button variant="outlined" color="secondary" size={"small"}
                      className={this.props.classes.adminButton} onClick={this.openAddZebe}>Add</Button>
              <Button variant="outlined" color="secondary" size={"small"} onClick={this.openDeactivateZebes}
                      className={this.props.classes.adminButton}>Deactivate</Button>
              <Button variant="outlined" color="secondary" size={"small"} onClick={this.openReactivateZebes}
                      className={this.props.classes.adminButton}>Reactivate</Button>
              <Button variant="outlined" color="secondary" size={"small"} onClick={this.openDeleteUsers}
                      className={this.props.classes.adminButton}>Delete</Button>
            </Grid> : null}
            <Grid item xs={10}>
              <Paper>
                <div className={this.props.classes.tableContainer}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Kerberos</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Email</TableCell>
                      { admin ? <TableCell>Edit</TableCell> : null}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.props.currentZebes ? this.props.currentZebes.map((zebe, idx) => {
                      return (
                        <TableRow key={idx}>
                          <TableCell>{zebe.name}</TableCell>
                          <TableCell>{zebe.kerberos}</TableCell>
                          <TableCell>{zebe.phone ? zebe.phone : null}</TableCell>
                          <TableCell>{zebe.email ? zebe.email : null}</TableCell>
                          { admin ? <TableCell>
                            <IconButton onClick={this.openEditPermissions(idx)}>
                              <EditOutlined fontSize={"inherit"}/>
                            </IconButton>
                          </TableCell> : null}
                        </TableRow>
                      )
                    }) : null}
                  </TableBody>
                </Table>
                </div>
              </Paper>
            </Grid>
          </Grid>
        </Fade>
      </React.Fragment>
    )
  }
}

Content.propTypes = {
  classes: PropTypes.object.isRequired,
  currentZebes: PropTypes.array.isRequired,
  potentialZebes: PropTypes.array,
  inactiveZebes: PropTypes.array,
  user: PropTypes.object.isRequired,
  token: PropTypes.string.isRequired,
  refreshToken: PropTypes.func.isRequired,
  timeoutToken: PropTypes.func.isRequired,
  validateZebes: PropTypes.func,
  getAdminInfo: PropTypes.func,
  deactivateZebes: PropTypes.func,
  reactivateZebes: PropTypes.func,
  deleteUsers: PropTypes.func,
  saveUserInfo: PropTypes.func.isRequired,
  saveEditPermissions: PropTypes.func
};

const getMapStateToProps = (NAME) => ((state) => ({
  currentZebes: state[NAME].currentZebes,
  potentialZebes: state[NAME].potentialZebes,
  inactiveZebes: state[NAME].inactiveZebes
}));

const getMapDispatchToProps = (PREFIX) => ((dispatch) => ({
  getCurrentZebes: (token) => dispatch(Actions.createGetCurrentZebes(PREFIX)(token)),
  saveUserInfo: Actions.editUserInfo,
  saveEditPermissions: (token, updateObj) => dispatch(Actions.editZebePermissions(PREFIX)(token, updateObj)),
  getAdminInfo: (token) => dispatch(Actions.getAdminInfo(PREFIX)(token)),
  validateZebes: (token, updateIDs) => dispatch(Actions.createValidateZebes(PREFIX)(token, updateIDs)),
  deactivateZebes: (token, updateIDs) => dispatch(Actions.createDeactivateZebes(PREFIX)(token, updateIDs)),
  reactivateZebes: (token, updateIDs) => dispatch(Actions.createReactivateZebes(PREFIX)(token, updateIDs)),
  deleteUsers: (token, updateIDs) => dispatch(Actions.createDeleteUsers(PREFIX)(token, updateIDs))
}));

export default (PREFIX, NAME) => connect(getMapStateToProps(NAME), getMapDispatchToProps(PREFIX))(withStyles(styles)(Content));