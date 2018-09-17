import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  Paper,
  Table, TableHead, TableBody, TableRow, TableCell,
  withStyles,
  Button, IconButton
} from '@material-ui/core';
import { Actions, State } from './services/redux';
import { EditInfo, EditPermissions } from './components';
import EditOutlined from '@material-ui/icons/EditOutlined';
import HowToReg from '@material-ui/icons/HowToReg';
import Block from '@material-ui/icons/Block';
import Add from '@material-ui/icons/Add';
import DeleteForever from '@material-ui/icons/DeleteForever';
import { WithLoader, AdminWrapper, SelectTable, ReduxWrapper } from "../../components";

const styles = theme => {
  return ({
    contentContainer: {
      flexWrap: "nowrap",
      height: "100%"
    },
    divContainer: {
      padding: theme.spacing.unit*2,
      maxWidth: "100%",
      height: "auto"
    },
    tableContainer: {
      overflowX: "scroll",
      height: "100%"
    },
  })
};

class Content extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      editInfo: false,
      editPermissions: false,
      editIndex: 0
    };
    this.openEditPermissions = this.openEditPermissions.bind(this);

    this.closeEditInfo = this.closeEditInfo.bind(this);

    this.openSetting = this.openSetting.bind(this);
    this.closeSetting = this.closeSetting.bind(this);
    this.saveSetting = this.saveSetting.bind(this);
  }

  openSetting(setting) {
    return () => this.setState({[setting] : true});
  }

  closeSetting(setting) {
    return () => this.setState({[setting]: false});
  }

  saveSetting(saveFunc) {
    return (idArray) => {
      return saveFunc(this.props.token, idArray).catch(() => {
        this.props.timeoutToken()
      }).then(contents => {
        if (contents) {
          this.props.refreshToken(contents.token, contents.user ? contents.user : null);
          return contents
        }
      })
    }
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

  openEditPermissions(idx) {
    return () => this.setState({editPermissions: true, editIndex: idx})
  }

  componentDidMount() {
    this.setState({loading: true});
    const admin = this.props.user.tech_chair || this.props.user.rush_chair || this.props.user.president;
    if (admin) {
      this.props.getAdminInfo(this.props.token).catch(() => {
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
    const addNewZebeForm = {
      content: <SelectTable title={"Add Zebes"} fieldNames={["name", "kerberos"]}
                            fieldHeaders={["Name", "Kerberos"]}
                            tooltipTitle={"Add new members"} icon={<Add />}
                            handleAction={this.saveSetting(this.props.validateZebes)}
                            contentList={this.props.potentialZebes || []}/>,
      tooltipTitle: "Add new members",
      icon: <Add />
    };
    const deactivateZebeForm = {
      content: <SelectTable title={"Deactivate Zebes"} fieldNames={["name", "kerberos"]}
                            fieldHeaders={["Name", "Kerberos"]} tooltipTitle={"Deactivate these zebes"}
                            handleAction={this.saveSetting(this.props.deactivateZebes)}
                            contentList={this.props.currentZebes || []} red icon={<Block />}/>,
      tooltipTitle: "Deactivate zebes",
      icon: <Block />
    };
    const reactivateZebeForm = {
      content: <SelectTable title={"Reactivate Zebes"} fieldNames={["name", "kerberos"]}
                            fieldHeaders={["Name", "Kerberos"]} tooltipTitle={"Reactivate these zebes"}
                            handleAction={this.saveSetting(this.props.reactivateZebes)}
                            contentList={this.props.inactiveZebes || []} icon={<HowToReg/>}/>,
      tooltipTitle: "Reactivate previously deactivated zebes",
      icon: <HowToReg />
    };
    const deleteUsersForm = {
      content: <SelectTable title={"Delete Permanently"} fieldNames={["name", "kerberos"]}
                            fieldHeaders={["Name", "Kerberos"]} tooltipTitle={"Delete these users and all related data"}
                            handleAction={this.saveSetting(this.props.deleteUsers)}
                            contentList={(this.props.potentialZebes && this.props.inactiveZebes) ?
                              this.props.potentialZebes.concat(this.props.inactiveZebes) : []} red icon={<DeleteForever/>} />,
      tooltipTitle: "Permanently delete zebes",
      icon: <DeleteForever />
    };

    const admin = this.props.user.tech_chair || this.props.user.rush_chair || this.props.user.president;
    return (
      <WithLoader loading={this.state.loading}>
        <AdminWrapper show={admin}
                      forms={[addNewZebeForm, deactivateZebeForm, reactivateZebeForm, deleteUsersForm]}>
        <React.Fragment>
          <EditInfo name={this.props.user.name}
                    kerberos={this.props.user.kerberos}
                    open={this.state.editInfo}
                    close={this.closeEditInfo}
                    oldPhone={this.props.user.phone}
                    oldEmail={this.props.user.email} saveInfo={this.saveSetting(this.props.saveUserInfo)}/>
          {admin && this.props.currentZebes[this.state.editIndex] ? <EditPermissions zebe={this.props.currentZebes[this.state.editIndex]}
                             open={this.state.editPermissions} close={this.closeSetting("editPermissions")}
                             savePermissions={this.saveSetting(this.props.saveEditPermissions)}/>
          : null }
          <div className={this.props.classes.divContainer}>
            <Grid direction={"column"} alignItems={"center"} justify={"center"} container
                  className={this.props.classes.contentContainer} spacing={16}>
              <Grid item>
                <Button variant="outlined" color="primary" onClick={this.openSetting("editInfo")}>Edit My Info</Button>
              </Grid>
              <Grid item xs={12}>
                <Paper>
                  <div className={this.props.classes.tableContainer}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Kerberos</TableCell>
                          <TableCell>Phone</TableCell>
                          <TableCell>Email</TableCell>
                          {admin ? <TableCell>Edit</TableCell> : null}
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
                              {admin ? <TableCell>
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
          </div>
        </React.Fragment>
        </AdminWrapper>
      </WithLoader>
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

export default ReduxWrapper(Actions, State)(withStyles(styles)(Content));