import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {
  Grid, Paper, Divider, Typography, IconButton, TextField,
  ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails,
  withStyles, withWidth
} from '@material-ui/core';
import {WithLoader} from '../../components';
import {
  MidnightDayToolbar, MidnightsTable, TypeForm,
  MidnightDetail, MidnightForm, AccountForm,
  MidnightReviewForm
} from './components';
import { NoteAddRounded, ExpandMore, EditOutlined, NoSim, Delete, Add, PersonAddDisabledRounded, PersonAddRounded, VerifiedUser } from '@material-ui/icons';
import { Actions } from './services/redux';
import { GenericTable, SelectTable, AdminWrapper } from "../../components";
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
      showing: (new Date()).getDay() % 7,
      editType: false,
      typeIdx: 0,
      midnightDetail: false,
      midnightAward: false,
      midnightIdx: 0,
      awardUnreviewed: false,
      unreviewedIdx: 0,
      editAccount: false,
      accountIdx: 0,
      currentDate: (new Date()).toISOString().substring(0,10),
      differentWeek: false
    };
    this.saveSetting = this.saveSetting.bind(this);
    this.authHandle = this.authHandle.bind(this);
    this.removeMidnight = this.removeMidnight.bind(this);
    this.handleDayChange = this.handleDayChange.bind(this);
  }

  handleDayChange(evt) {
    let newDate = evt.target.value;
    let lastDate = moment.parseZone(this.state.currentDate);
    let now = moment();
    let changeWeek = (lastDate.isoWeekYear() !== moment.parseZone(newDate).isoWeekYear()) || (lastDate.isoWeek() !== moment.parseZone(newDate).isoWeek());
    this.setState({loading: true});
    this.authHandle(this.props.changeDay(this.props.token, {date: moment.parseZone(newDate).toISOString()})).then((content) => {
      if (content) {
        this.setState({
          loading:false,
          currentDate: newDate,
          differentWeek: (now.isoWeekYear() !== moment.parseZone(newDate).isoWeekYear()) || (now.isoWeek() !== moment.parseZone(newDate).isoWeek()),
          showing: changeWeek ? moment.parseZone(newDate).day() : this.state.showing
        });
      }
    })
  }

  removeMidnight(id) {
    return () => {
      this.setState({midnightDetail: false, loading: true});
      return this.authHandle(
        this.props.deleteMidnight(this.props.token, id, moment.parseZone(this.state.currentDate).toISOString())
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

  saveSetting(saveFunc) {
    return (idArray) => {
      return this.authHandle(saveFunc(this.props.token, idArray, moment.parseZone(this.state.currentDate).toISOString()))
    }
  }

  componentDidMount() {
    this.setState({loading: true});
    this.authHandle(this.props.fetchAll(this.props.token, this.props.user.midnight_maker)).then((content) => {
      if (content) this.setState({loading: false})
    })
  }

  render() {
    let midnights = this.props.midnights;
    let showingDate = midnights.length ? moment.parseZone(midnights[this.state.showing].date) : moment();
    let showingMidnights = midnights.length ? midnights[this.state.showing].midnights : [];
    let admin = this.props.user.midnight_maker;
    const addTypeForm = {
      content: <TypeForm submit={this.saveSetting(this.props.addType)}/>,
      tooltipTitle: "Add a type of midnight",
      icon: <NoteAddRounded/>
    };
    const deleteTypeForm = {
      content: <SelectTable  contentList={this.props.typeList}
                             handleAction={this.saveSetting(this.props.deleteTypes)}
                             fieldHeaders={["Name", "Value", "Description"]} icon={<Delete />}
                             fieldNames={["name","value","description"]} red
                             title={"Delete Midnight Type"} tooltipTitle={"Delete these midnight types and associated midnights"}/>,
      tooltipTitle: "Remove a type of midnight",
      icon: <NoSim />
    };
    const addMidnightForm = {
      content: <MidnightForm submit={this.saveSetting(this.props.addMidnight)}
                             tasks={this.props.typeList}
                             accounts={this.props.accounts}/>,
      tooltipTitle: "Add a Midnight",
      icon: <Add />
    };
    const addAccountForm = {
      content: <SelectTable contentList={this.props.potentialAccounts} fieldHeaders={["Name", "Kerberos"]}
                            fieldNames={["name","kerberos"]} title={"Open Midnight Account"}
                            tooltipTitle={"Open accounts"} icon={<PersonAddRounded />}
                            handleAction={this.saveSetting(this.props.addAccounts)}/>,
      tooltipTitle: "Open Midnight Account",
      icon: <PersonAddRounded />
    };
    const deleteAccountForm = {
      content: <SelectTable contentList={this.props.accounts}
                            handleAction={this.saveSetting(this.props.deleteAccounts)}
                            fieldHeaders={["Zebe", "Points", "Requirement"]} icon={<Delete />}
                            getField={(account) => [account.zebe.name+"("+account.zebe.kerberos+")",account.balance,account.requirement]}
                            red title={"Delete Midnight Accounts"} tooltipTitle={"Delete these accounts and associated midnights"}/>,
      tooltipTitle: "Delete Zebes' midnight accounts",
      icon: <PersonAddDisabledRounded />
    };
    let { classes, width } = this.props;
    let mdUp = width !== "sm" && width !== "xs";
    return (
      <WithLoader loading={this.state.loading}>
        <AdminWrapper forms={[deleteTypeForm, addTypeForm, deleteAccountForm, addAccountForm, addMidnightForm]} show={admin}>
          <React.Fragment>
            {
              admin && this.props.typeList[this.state.typeIdx]?
                <TypeForm open={this.state.editType} key={this.props.typeList[this.state.typeIdx]._id}
                          close={()=>this.setState({editType:false})}
                          defaultType={this.props.typeList[this.state.typeIdx]}
                          submit={(editObj) => this.authHandle(this.props.editType(this.props.token,
                            {...editObj, _id: this.props.typeList[this.state.typeIdx]._id}
                          ))} />
              : null
            }
            {
              showingMidnights[this.state.midnightIdx] ? admin ?
                <React.Fragment>
                  <MidnightForm open={this.state.midnightDetail} key={showingMidnights[this.state.midnightIdx]._id + "e"}
                                defaultMidnight={showingMidnights[this.state.midnightIdx]}
                                close={() => this.setState({midnightDetail: false})}
                                remove={this.removeMidnight(showingMidnights[this.state.midnightIdx]._id)}
                                accounts={this.props.accounts} tasks={this.props.typeList}
                                submit={this.saveSetting(this.props.editMidnight)}/>
                  <MidnightReviewForm open={this.state.midnightAward} close={()=>this.setState({midnightAward:false})}
                                      key={showingMidnights[this.state.midnightIdx]._id+"a"}
                                      submit={this.saveSetting(this.props.awardMidnight)}
                                      midnight={showingMidnights[this.state.midnightIdx]}/>
                </React.Fragment> :
                <MidnightDetail open={this.state.midnightDetail} midnight={showingMidnights[this.state.midnightIdx]}
                                close={()=>this.setState({midnightDetail: false})} />
                : null
            }
            {
              admin && this.props.unreviewed[this.state.unreviewedIdx] ?
                <MidnightReviewForm open={this.state.awardUnreviewed} submitTriggersClose
                                    key={this.props.unreviewed[this.state.unreviewedIdx]._id + "u"}
                                    close={()=>this.setState({awardUnreviewed:false})}
                                    submit={this.saveSetting(this.props.awardMidnight)}
                                    midnight={this.props.unreviewed[this.state.unreviewedIdx]}/>
                : null
            }
            {
              admin && this.props.accounts[this.state.accountIdx] ?
                <AccountForm key={this.props.accounts[this.state.accountIdx]._id}
                             open={this.state.editAccount} close={() => this.setState({editAccount: false})}
                             defaultAccount={this.props.accounts[this.state.accountIdx]}
                             submit={this.saveSetting(this.props.editAccount)}/>
                : null
            }
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
                                        today={(new Date()).getDay() % 7} differentWeek={this.state.differentWeek}
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
                    <GenericTable tableContent={admin ? this.props.accounts.map((acc, idx) => ({...acc,
                      edit: <IconButton onClick={()=>this.setState({editAccount: true, accountIdx: idx})}><EditOutlined /></IconButton>
                    })) :this.props.accounts }
                                  tableHeaders={admin?["Zebe", "Points","Requirement","Edit"]:["Zebe","Points","Requirement"]}
                                  getFields={(content)=>{
                                    let arr = [
                                      content.zebe.name,
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

const mapStateToProps = (NAME) => ((state)=>({
  typeList: state[NAME].types,
  midnights: state[NAME].midnights,
  accounts: state[NAME].accounts,
  potentialAccounts: state[NAME].potentialAccounts,
  unreviewed: state[NAME].unreviewed
}));

const mapDispatchToProps = (PREFIX) => ((dispatch) => ({
  addType: (token, typeObj) => dispatch(Actions.createTypeAction(PREFIX)(token, typeObj)),
  fetchAll: (token, admin) => dispatch(Actions.createFetchMidnightData(PREFIX)(token, admin)),
  editType: (token, typeObj) => dispatch(Actions.createTypeAction(PREFIX)(token, typeObj, {edit: true})),
  deleteTypes: (token, typeIds, weekDate) => dispatch(Actions.createTypeAction(PREFIX)(token, {deleted: typeIds, weekDate}, {remove: true})),
  addMidnight: (token, midnightObj, weekDate) => dispatch(Actions.createMidnightAction(PREFIX)(token, { ...midnightObj, weekDate })),
  editMidnight: (token, midnightObj, weekDate) => dispatch(Actions.createMidnightAction(PREFIX)(token, {...midnightObj, weekDate}, {edit: true})),
  deleteMidnight: (token, id, weekDate) => dispatch(Actions.createMidnightAction(PREFIX)(token, {deleted: [id], weekDate}, {remove: true})),
  addAccounts: (token, userIds) => dispatch(Actions.createAccountAction(PREFIX)(token, {zebes: userIds})),
  editAccount: (token, payload) => dispatch(Actions.createAccountAction(PREFIX)(token, payload, {edit: true})),
  deleteAccounts: (token, ids, weekDate) => dispatch(Actions.createAccountAction(PREFIX)(token, {deleted: ids, weekDate}, {remove: true})),
  awardMidnight: (token, payload, weekDate) => dispatch(Actions.createMidnightAward(PREFIX)(token, { ...payload, weekDate})),
  changeDay: (token, date) => dispatch(Actions.createChangeWeek(PREFIX)(token, date))
}));

const reduxProps = {
  typeList: PropTypes.array.isRequired,
  midnights: PropTypes.array.isRequired,
  accounts: PropTypes.array.isRequired,
  potentialAccounts: PropTypes.array.isRequired,
  unreviewed: PropTypes.array.isRequired,
  addType: PropTypes.func.isRequired,
  editType: PropTypes.func.isRequired,
  fetchAll: PropTypes.func.isRequired,
  addMidnight: PropTypes.func.isRequired,
  editMidnight: PropTypes.func.isRequired,
  deleteMidnight: PropTypes.func.isRequired,
  addAccounts: PropTypes.func.isRequired,
  editAccount: PropTypes.func.isRequired,
  deleteAccounts: PropTypes.func.isRequired,
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


export default (PREFIX, NAME) =>
  connect(mapStateToProps(NAME), mapDispatchToProps(PREFIX))(withWidth()(withStyles(styles)(MidnightContent)))