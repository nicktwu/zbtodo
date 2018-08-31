import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Typography, Tooltip,
  withStyles, IconButton, Badge
} from '@material-ui/core';
import {lighten, darken} from '@material-ui/core/styles/colorManipulator';

const DAYNAMES = [
  "SUN",
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT"
];

const buttonStyles = (theme) => ({
  active: {
    backgroundColor: lighten(theme.palette.background.paper, 0.15),
  },
  today: {
    backgroundColor: theme.palette.primary.dark,
    "&:hover": {
      backgroundColor: darken(theme.palette.primary.dark, 0.1),
    }
  },
  container: {
    textAlign: "center"
  }
});

const MidnightToolbarCell = ({ active, today, handleClick, dayNumber, numMidnights, classes, differentWeek}) => {
  let message = "";
  if (numMidnights) {
    let onlyOne = numMidnights === 1;
    let midnightNumberString = onlyOne ? "a midnight" : (numMidnights.toString() + " midnights");
    if (today === 0) {
      message = "You have " + midnightNumberString + " today!"
    } else if (today > 0) {
      message = "You had " + midnightNumberString + " on this day!"
    } else {
      message = "You have " + midnightNumberString + " on this day!"
    }
  } else if (today === 0) {
    message = "Today"
  }
  if (differentWeek) {
    message = "";
  }
  return (
    <Grid item xs className={classes.container}>
    <Tooltip title={message}>
      <IconButton className={today === 0 && !differentWeek ? classes.today : active ? classes.active : ""} onClick={handleClick}>
        { numMidnights > 0 ? <Badge badgeContent={numMidnights} color={"error"}>{dayNumber}</Badge> : dayNumber}
      </IconButton>
    </Tooltip>
    </Grid>
  )
};

MidnightToolbarCell.propTypes = {
  dayNumber: PropTypes.number.isRequired,
  classes: PropTypes.object.isRequired,
  active: PropTypes.bool.isRequired,
  numMidnights: PropTypes.number.isRequired,
  differentWeek: PropTypes.bool,
  today: PropTypes.number.isRequired,
  handleClick: PropTypes.func.isRequired
};

const StyledToolbarCell = withStyles(buttonStyles)(MidnightToolbarCell);

const styles = (theme) => ({
  textLabel: {
    textAlign: "center",
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit
  },
  navContainer: {
    paddingTop: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    borderTopColor: theme.palette.text.disabled,
    borderTopStyle: "solid",
    borderTopWidth: "1px",
    borderBottomColor: theme.palette.text.disabled,
    borderBottomStyle: "solid",
    borderBottomWidth: "1px"
  },
  largeContainer: {
    margin: theme.spacing.unit,
    borderTopColor: theme.palette.text.disabled,
    borderTopStyle: "solid",
    borderTopWidth: "1px",
    borderBottomColor: theme.palette.text.disabled,
    borderBottomStyle: "solid",
    borderBottomWidth: "1px"
  },
  spaceless: {
    borderTopColor: theme.palette.text.disabled,
    borderTopStyle: "solid",
    borderTopWidth: "1px",
    borderBottomColor: theme.palette.text.disabled,
    borderBottomStyle: "solid",
    borderBottomWidth: "1px"
  },
  dayName: {
    textAlign: "right",
    fontSize: theme.typography.caption.fontSize
  }
});

class MidnightToolbar extends Component {
  render() {
    if (this.props.mobile) {
      if (this.props.tiny) {
        return (
          <Grid item xs={12}>
            <Grid container direction={"row"} alignItems={"center"} className={this.props.classes.spaceless}>
              {this.props.midnightInfo.map((info, idx) => {
                return (
                  <Grid item xs key={idx} className={this.props.classes.navContainer}>
                    <Grid container direction={"row"} alignItems={"center"} justify={"center"}>
                      <StyledToolbarCell active={idx === this.props.active} differentWeek={this.props.differentWeek}
                                         today={this.props.today - idx} handleClick={this.props.handleClick(idx)}
                                         dayNumber={info.dayNumber} numMidnights={info.numMidnights}/>
                    </Grid>
                  </Grid>
                )
              })}
            </Grid>
          </Grid>
        )
      } else {
        return (
          <Grid item xs={3}>
            <Grid container direction={"column"} className={this.props.classes.largeContainer}>
              {this.props.midnightInfo.map((info, idx) => {
                return (
                  <Grid item xs key={idx} className={this.props.classes.navContainer}>
                    <Grid container direction={"row"} alignItems={"center"} justify={"center"}>
                      <Grid item xs className={this.props.classes.dayName}>
                        <Typography variant="subheading"
                                    className={this.props.classes.textLabel}>{DAYNAMES[idx]}</Typography>
                      </Grid>
                      <StyledToolbarCell active={idx === this.props.active} differentWeek={this.props.differentWeek}
                                         today={this.props.today - idx} handleClick={this.props.handleClick(idx)}
                                         dayNumber={info.dayNumber} numMidnights={info.numMidnights}/>
                    </Grid>
                  </Grid>
                )
              })}
            </Grid>
          </Grid>
        )
      }
    } else {
      return (
        <React.Fragment>
          <Grid container>
            { DAYNAMES.map((name) => (
              <Grid item xs key={name}>
                <Typography variant="subheading" className={this.props.classes.textLabel}>{name}</Typography>
              </Grid>
            ))}
          </Grid>
          <Grid container>
            { this.props.midnightInfo.map((info, idx) => {
              return (
                <StyledToolbarCell key={idx} active={idx === this.props.active} differentWeek={this.props.differentWeek}
                                   today={this.props.today - idx} handleClick={this.props.handleClick(idx)}
                                   dayNumber={info.dayNumber} numMidnights={info.numMidnights}/>
              )
            })}
          </Grid>
        </React.Fragment>
      )
    }
  }
}

MidnightToolbar.propTypes = {
  tiny: PropTypes.bool,
  differentWeek: PropTypes.bool,
  today: PropTypes.number.isRequired,
  active: PropTypes.number.isRequired,
  mobile: PropTypes.bool.isRequired,
  midnightInfo: PropTypes.array.isRequired,
  classes: PropTypes.object.isRequired,
  handleClick: PropTypes.func.isRequired
};

export default withStyles(styles)(MidnightToolbar);