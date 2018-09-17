import React, {Component, Fragment} from 'react';
import {Actions, State} from './services/redux';
import PropTypes from 'prop-types';
import { Grid, IconButton, Button, Card, CardHeader, CardContent, CardActions, Tooltip, withStyles } from '@material-ui/core';
import { GenericTable, ReduxWrapper } from "../../components";
import MoveToInbox from '@material-ui/icons/MoveToInbox';
import {MidnightTradeForm, PostMidnightTrade} from './components';

const styles = (theme) => ({
  gridItemPadded: {
    padding: theme.spacing.unit
  }
});

class Content extends Component {
  constructor(props) {
    super(props);
    this.state = {loading: true};
    this.authHandle = this.authHandle.bind(this);
    this.saveSetting = this.saveSetting.bind(this);
  }

  componentDidMount() {
    this.props.refreshData(this.props.token).catch(() => {
      this.setState({loading: false});
      this.props.timeoutToken();
    }).then(contents => {
      if (contents) {
        this.props.refreshToken(contents.token);
        this.setState({loading: false});
      }
    })
  }

  saveSetting(saveFunc, modifyPayload=(x=>x) ) {
    return (idArray) => {
      return this.authHandle(saveFunc(this.props.token, modifyPayload(idArray)))
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


  render() {
    return (
      <Fragment>
        <Grid direction={"column"} alignItems={"stretch"} justify={"flex-start"}
              container className={this.props.classes.gridItemPadded}
              style={{height: "100%"}}>
          <Grid item>
            <Card>
              <CardHeader title={"Midnight Trades"}/>
              <CardContent>
                <PostMidnightTrade midnights={this.props.tradeableMidnights} submit={this.saveSetting(this.props.giveMidnight)}/>
                <GenericTable tableContent={this.props.midnightTrades.sort((tradeA, tradeB) => { return tradeA.midnight.date.substr(0,10) < tradeB.midnight.date.substr(0,10) ? -1 : 1})}
                              tableHeaders={["Midnight Date", "Midnight Type", "Additional Points Offered", "Actions"]}
                              getFields={(trade) => {
                                return [
                                  trade.midnight.date.substr(0, 10),
                                  trade.midnight.task.name,
                                  trade.pointsOffered || 0,
                                  this.props.user._id === trade.midnight.account.zebe._id ?
                                    <MidnightTradeForm submit={this.saveSetting(this.props.updateTrade)}
                                                       remove={this.saveSetting(this.props.deleteTrade, ()=>({_id:trade._id}))}
                                                       trade={trade}/> : <Tooltip title={"Take midnight"}>
                                      <IconButton color={"secondary"}
                                                  onClick={this.saveSetting(this.props.executeTrade, ()=>({_id:trade._id}))}>
                                        <MoveToInbox/>
                                      </IconButton>
                                    </Tooltip>
                                ]
                              }}/>
              </CardContent>
              <CardActions>
                <Button variant="raised" color="primary" onClick={this.componentDidMount.bind(this)}>Refresh Data</Button>
              </CardActions>
              <CardContent>
                <GenericTable tableContent={this.props.tradeAnnouncements}
                              tableHeaders={["Completed Trades"]} tableFields={["message"]}/>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Fragment>
    )
  }
}

Content.propTypes = {
  token: PropTypes.string.isRequired,
  refreshToken: PropTypes.func.isRequired,
  timeoutToken: PropTypes.func.isRequired,
  midnightTrades: PropTypes.array,
  refreshData: PropTypes.func.isRequired,
  giveMidnight: PropTypes.func.isRequired,
  updateTrade: PropTypes.func.isRequired,
  deleteTrade: PropTypes.func.isRequired,
  executeTrade: PropTypes.func.isRequired
};

export default ReduxWrapper(Actions, State)(withStyles(styles)(Content));