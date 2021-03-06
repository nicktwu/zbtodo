import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Paper, Divider, Typography, IconButton, TextField,
  ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails,
  withStyles, withWidth, Button
} from '@material-ui/core';
import {WithLoader} from '../../components';
import {
  MidnightDayToolbar, MidnightsTable, TypeForm,
  MidnightDetail, MidnightForm, AccountForm, MidnightRequirementForm,
  MidnightReviewForm, PreferenceForm, MidnightGenerateForm
} from './components';
import NoteAddRounded from '@material-ui/icons/NoteAddRounded';
import ExpandMore from '@material-ui/icons/ExpandMore';
import EditOutlined from '@material-ui/icons/EditOutlined';
import NoSim from '@material-ui/icons/NoSim';
import AssignmentRounded from '@material-ui/icons/AssignmentRounded';
import AssignmentTurnedIn from '@material-ui/icons/AssignmentTurnedIn';
import Delete from '@material-ui/icons/Delete';
import Add from '@material-ui/icons/Add';
import PersonAddDisabledRounded from '@material-ui/icons/PersonAddDisabledRounded';
import PersonAddRounded from '@material-ui/icons/PersonAddRounded';
import VerifiedUser from '@material-ui/icons/VerifiedUser';
import { Actions, State } from './services/redux';
import { GenericTable, SelectTable, AdminWrapper, ReduxWrapper } from "../../components";
import moment from 'moment';

const MONTHS = [
  "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
];

const styles = (theme) => ({
  contentContainer: {
    padding: theme.spacing.unit * 3,
    flexWrap: "nowrap",
    overflowY: "auto"
  },
  gridItem: {
    maxWidth: "none",
    padding: theme.spacing.unit*2
  },
  largePadding: {
    paddingLeft: theme.spacing.unit*4,
    paddingRight: theme.spacing.unit*2,
    paddingTop: theme.spacing.unit*2,
    paddingBottom: theme.spacing.unit*2
  },
  paper: {
    padding: theme.spacing.unit
  },
  divider: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit
  },
  littlePadding: {
    padding: theme.spacing.unit*0.5
  },
  withOverflow: {
    overflowX: "auto"
  },
  centerText: {
    textAlign: "center"
  }
});

class MidnightContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      showing: moment().day() % 7,
      editType: false,
      typeIdx: 0,
      midnightDetail: false,
      midnightAward: false,
      midnightIdx: 0,
      awardUnreviewed: false,
      unreviewedIdx: 0,
      editAccount: false,
      accountIdx: 0,
      currentDate: moment().toISOString().substring(0,10),
      differentWeek: false,
      preferenceForm: false
    };
    this.saveSetting = this.saveSetting.bind(this);
    this.authHandle = this.authHandle.bind(this);
    this.removeMidnight = this.removeMidnight.bind(this);
    this.handleDayChange = this.handleDayChange.bind(this);
    this.formatDelete = this.formatDelete.bind(this);
    this.formatWithDate = this.formatWithDate.bind(this);
  }

  formatWithDate(data) {
    return {...data, weekDate: moment.parseZone(this.state.currentDate).toISOString()}
  }

  formatDelete(ids) {
    return this.formatWithDate({deleted: ids})
  }

  handleDayChange(evt) {
    let newDate = evt.target.value;
    let lastDate = moment.parseZone(this.state.currentDate);
    let now = moment();
    let changeWeek = (lastDate.weekYear() !== moment.parseZone(newDate).weekYear()) || (lastDate.week() !== moment.parseZone(newDate).week());
    this.setState({loading: true});
    this.authHandle(this.props.changeDay(this.props.token, {date: moment.parseZone(newDate).toISOString()})).then((content) => {
      if (content) {
        this.setState({
          loading:false,
          currentDate: newDate,
          differentWeek: (now.weekYear() !== moment.parseZone(newDate).weekYear()) || (now.week() !== moment.parseZone(newDate).week()),
          showing: changeWeek ? moment.parseZone(newDate).day() : this.state.showing
        });
      }
    })
  }

  removeMidnight(id) {
    return () => {
      this.setState({midnightDetail: false, loading: true});
      return this.authHandle(
        this.props.deleteMidnight(this.props.token, this.formatWithDate({ deleted: [id]}))
      ).then((contents) => {
        if (contents) {
          this.setState({loading: false})
        }
      })
    }
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

  saveSetting(saveFunc, modifyPayload=(x=>x) ) {
    return (idArray) => {
      return this.authHandle(saveFunc(this.props.token, modifyPayload(idArray)))
    }
  }

  componentDidMount() {
    this.setState({loading: true});
    this.authHandle(this.props.user.midnight_maker ? this.props.fetchAdmin(this.props.token) : this.props.fetchAll(this.props.token))
      .then((content) => { if (content) this.setState({loading: false}) })
  }

  render() {
    let midnights = this.props.midnights;
    let showingDate = midnights.length ? moment.parseZone(midnights[this.state.showing].date) : moment();
    let showingMidnights = midnights.length ? midnights[this.state.showing].midnights.sort((midnightA, midnightB) => {
      if (midnightA.task.name > midnightB.task.name) return 1;
      if (midnightB.task.name > midnightA.task.name) return -1;
      return 0
    }) : [];
    let admin = this.props.user.midnight_maker;
    const addTypeForm = {
      content: <TypeForm submit={this.saveSetting(this.props.addType)}/>,
      tooltipTitle: "Add a type of midnight",
      icon: <NoteAddRounded/>
    };
    const deleteTypeForm = {
      content: <SelectTable  contentList={this.props.typeList}
                             handleAction={this.saveSetting(this.props.deleteTypes, this.formatDelete)}
                             fieldHeaders={["Name", "Value", "Description"]} icon={<Delete />}
                             fieldNames={["name","value","description"]} red
                             title={"Delete Midnight Type"} tooltipTitle={"Delete these midnight types and associated midnights"}/>,
      tooltipTitle: "Remove a type of midnight",
      icon: <NoSim />
    };
    const addMidnightForm = {
      content: <MidnightForm submit={this.saveSetting(this.props.addMidnight, this.formatWithDate)}
                             tasks={this.props.typeList}
                             accounts={this.props.accounts}/>,
      tooltipTitle: "Add a Midnight",
      icon: <Add />
    };
    const addAccountForm = {
      content: <SelectTable contentList={this.props.potentialAccounts} fieldHeaders={["Name", "Kerberos"]}
                            fieldNames={["name","kerberos"]} title={"Open Midnight Account"}
                            tooltipTitle={"Open accounts"} icon={<PersonAddRounded />}
                            handleAction={this.saveSetting(this.props.addAccounts, arr=>({zebes:arr}))}/>,
      tooltipTitle: "Open Midnight Account",
      icon: <PersonAddRounded />
    };
    const deleteAccountForm = {
      content: <SelectTable contentList={this.props.accounts}
                            handleAction={this.saveSetting(this.props.deleteAccounts, this.formatDelete)}
                            fieldHeaders={["Zebe", "Points", "Requirement"]} icon={<Delete />}
                            getField={(account) => [account.zebe.name+"("+account.zebe.kerberos+")",account.balance,account.requirement]}
                            red title={"Delete Midnight Accounts"} tooltipTitle={"Delete these accounts and associated midnights"}/>,
      tooltipTitle: "Delete Zebes' midnight accounts",
      icon: <PersonAddDisabledRounded />
    };
    const midnightGenerateForm = {
      content: <MidnightGenerateForm handleGenerate={()=>{
        this.setState({loading: true});
        this.authHandle(this.props.generateMidnights(this.props.token)).then(content => {
          if (content) this.setState({ loading: false })
        });
      }}/>,
      tooltipTitle: "Generate new midnights for the week",
      icon: <AssignmentRounded />
    };
    const midnightReqForm = {
      content: <MidnightRequirementForm handleSave={(saveVal) => {
        if (saveVal) {
          this.setState({loading: true});
          this.authHandle(this.props.setRequirement(this.props.token, saveVal)).then(content => {
            if(content) this.setState({loading: false});
          })
        }
      }} />,
      tooltipTitle: "Set a requirement",
      icon: <AssignmentTurnedIn />
    };
    let { classes, width } = this.props;
    let mdUp = width !== "sm" && width !== "xs";
    return (
      <WithLoader loading={this.state.loading}>
        <AdminWrapper forms={[
          deleteTypeForm,
          addTypeForm, deleteAccountForm,
          addAccountForm, addMidnightForm,
          midnightReqForm,
          midnightGenerateForm
        ]} show={admin}>
          <React.Fragment>
            {admin && this.props.typeList[this.state.typeIdx]?
                <TypeForm open={this.state.editType} key={this.props.typeList[this.state.typeIdx]._id}
                          close={()=>this.setState({editType:false})}
                          defaultType={this.props.typeList[this.state.typeIdx]}
                          submit={this.saveSetting(this.props.editType)} />
              : null}
            {showingMidnights[this.state.midnightIdx] ? admin ?
                <React.Fragment>
                  <MidnightForm open={this.state.midnightDetail} key={showingMidnights[this.state.midnightIdx]._id + "e"}
                                defaultMidnight={showingMidnights[this.state.midnightIdx]}
                                close={() => this.setState({midnightDetail: false})}
                                remove={this.removeMidnight(showingMidnights[this.state.midnightIdx]._id)}
                                accounts={this.props.accounts} tasks={this.props.typeList}
                                submit={this.saveSetting(this.props.editMidnight, this.formatWithDate)}/>
                  <MidnightReviewForm open={this.state.midnightAward} close={()=>this.setState({midnightAward:false})}
                                      key={showingMidnights[this.state.midnightIdx]._id+"a"}
                                      submit={this.saveSetting(this.props.awardMidnight, this.formatWithDate)}
                                      midnight={showingMidnights[this.state.midnightIdx]}/>
                </React.Fragment> :
                <MidnightDetail open={this.state.midnightDetail} midnight={showingMidnights[this.state.midnightIdx]}
                                close={()=>this.setState({midnightDetail: false})} /> : null}
            {admin && this.props.unreviewed[this.state.unreviewedIdx] ?
                <MidnightReviewForm open={this.state.awardUnreviewed} submitTriggersClose
                                    key={this.props.unreviewed[this.state.unreviewedIdx]._id + "u"}
                                    close={()=>this.setState({awardUnreviewed:false})}
                                    submit={this.saveSetting(this.props.awardMidnight)}
                                    midnight={this.props.unreviewed[this.state.unreviewedIdx]}/> : null}
            {admin && this.props.accounts[this.state.accountIdx] ?
                <AccountForm key={this.props.accounts[this.state.accountIdx]._id}
                             open={this.state.editAccount} close={() => this.setState({editAccount: false})}
                             defaultAccount={this.props.accounts[this.state.accountIdx]}
                             submit={this.saveSetting(this.props.editAccount)}/> : null}

            <Grid container className={classes.contentContainer} justify={"center"} direction={"column"}>
              <Grid item xs className={classes.centerText}>
                <TextField value={this.state.currentDate}
                           type={"date"} label={"View the week of"}
                           onChange={this.handleDayChange}/>
              </Grid>
              <Grid item className={classes.gridItem} xs>
                <Paper className={mdUp ? classes.paper : null}>
                  <Grid container direction={mdUp ? "column" : "row"}>
                    <MidnightDayToolbar mobile={!mdUp} tiny={width==="xs"} active={this.state.showing}
                                        today={moment().day() % 7} differentWeek={this.state.differentWeek}
                                        midnightInfo={midnights.map((dayMidnights) => {
                                          let resObj = {};
                                          resObj.dayNumber = moment.parseZone(dayMidnights.date).date();
                                          resObj.numMidnights = dayMidnights.midnights.filter((val) => val.account.zebe._id === this.props.user._id).length;
                                          return resObj
                                        })} handleClick={(idx) => (() => {this.setState({showing: idx})})}/>
                    { mdUp ? <Divider className={classes.divider}/> : null}
                    <Grid item xs={!mdUp} className={mdUp ? classes.gridItem : classes.largePadding}>
                      <Typography variant={"title"}
                                  gutterBottom>{MONTHS[showingDate.month()]} {showingDate.date().toString()}, {showingDate.year().toString()}</Typography>
                      <MidnightsTable admin={admin} midnights={showingMidnights} userId={this.props.user._id}
                                      handleAward={(idx) => (() => this.setState({midnightAward: true, midnightIdx: idx}))}
                                      handleClick={(idx) => (() => this.setState({midnightDetail: true, midnightIdx: idx}))}/>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              {
                (new Set(this.props.accounts.map(acc => acc.zebe._id))).has(this.props.user._id) ?
                  <React.Fragment>
                    <Grid item xs className={classes.centerText}>
                      <Button variant={"outlined"} onClick={()=>this.setState({preferenceForm: true})}>Edit My Midnight Preferences</Button>
                    </Grid>
                    <PreferenceForm open={this.state.preferenceForm} tasks={this.props.typeList}
                                    account={this.props.accounts.filter(acc => acc.zebe._id === this.props.user._id)[0]}
                                    close={()=>this.setState({preferenceForm: false})}  submit={this.saveSetting(this.props.updatePreferences)}/>
                  </React.Fragment> : null
              }

              <Grid item className={classes.gridItem} xs>
                <ExpansionPanel>
                  <ExpansionPanelSummary expandIcon={<ExpandMore/>}>
                    <Typography variant="subheading">Midnight Descriptions</Typography>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails className={this.props.classes.withOverflow}>
                    <GenericTable tableContent={admin ? this.props.typeList.map((type, idx) =>
                      ({...type,
                        edit: <IconButton onClick={()=>this.setState({editType: true, typeIdx: idx})}><EditOutlined /></IconButton>
                      })) : this.props.typeList}
                                  tableHeaders={admin?["Name","Points","Description","Edit"]:["Name","Points","Description"]}
                                  tableFields={admin?["name","value","description","edit"]:["name","value","description"]}/>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
                <ExpansionPanel>
                  <ExpansionPanelSummary expandIcon={<ExpandMore/>}>
                    <Typography variant="subheading">Midnight Points</Typography>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails className={this.props.classes.withOverflow}>
                    <GenericTable tableContent={(admin ? this.props.accounts.map((acc, idx) => ({...acc,
                      edit: <IconButton onClick={()=>this.setState({editAccount: true, accountIdx: idx})}><EditOutlined /></IconButton>
                    })) : this.props.accounts).sort((acctA, acctB)=>{
                      return (acctB.balance || 0) - (acctA.balance || 0)
                    })}
                                  tableHeaders={admin?["Zebe", "Points","Requirement","Edit"]:["Zebe","Points","Requirement"]}
                                  getFields={(content)=>{
                                    let arr = [
                                      content.zebe.name + " (" + content.zebe.kerberos + ")",
                                      content.balance || 0,
                                      content.requirement || 0,
                                    ];
                                    if (admin) arr.push(content.edit);
                                    return arr;
                                  }} />
                  </ExpansionPanelDetails>
                </ExpansionPanel>
                { admin ? <ExpansionPanel>
                  <ExpansionPanelSummary expandIcon={<ExpandMore/>}>
                    <Typography variant="subheading">Unreviewed Midnights</Typography>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails className={this.props.classes.withOverflow}>
                    <GenericTable tableContent={this.props.unreviewed}
                                  tableHeaders={["Date", "Task", "Zebe", "Review"]}
                                  getFields={(content,idx) =>[
                                    content.date.toString().substring(0,10),
                                    content.task.name,
                                    content.account.zebe.name,
                                    <IconButton onClick={()=>this.setState({unreviewedIdx: idx, awardUnreviewed: true})}>
                                      <VerifiedUser />
                                    </IconButton>
                                  ]}/>
                  </ExpansionPanelDetails>
                </ExpansionPanel> : null}
              </Grid>
            </Grid>
          </React.Fragment>
        </AdminWrapper>
      </WithLoader>
    )
  }
}

const reduxProps = {
  typeList: PropTypes.array.isRequired,
  midnights: PropTypes.array.isRequired,
  accounts: PropTypes.array.isRequired,
  potentialAccounts: PropTypes.array.isRequired,
  unreviewed: PropTypes.array.isRequired,
  addType: PropTypes.func.isRequired,
  editType: PropTypes.func.isRequired,
  fetchAll: PropTypes.func.isRequired,
  fetchAdmin: PropTypes.func.isRequired,
  addMidnight: PropTypes.func.isRequired,
  editMidnight: PropTypes.func.isRequired,
  deleteMidnight: PropTypes.func.isRequired,
  generateMidnights: PropTypes.func.isRequired,
  addAccounts: PropTypes.func.isRequired,
  editAccount: PropTypes.func.isRequired,
  deleteAccounts: PropTypes.func.isRequired,
  updatePreferences: PropTypes.func.isRequired,
  setRequirement: PropTypes.func.isRequired,
  awardMidnight: PropTypes.func.isRequired,
  changeDay: PropTypes.func.isRequired
};

const authProps = {
  user: PropTypes.object.isRequired,
  token: PropTypes.string.isRequired,
  refreshToken: PropTypes.func.isRequired,
  timeoutToken: PropTypes.func.isRequired,
};

const styleProps = {
  classes: PropTypes.object.isRequired,
  width: PropTypes.string.isRequired
};

MidnightContent.propTypes = {
  ...authProps,
  ...styleProps,
  ...reduxProps
};

export default ReduxWrapper(Actions, State)(withWidth()(withStyles(styles)(MidnightContent)))