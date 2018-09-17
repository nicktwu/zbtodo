import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {
  FormControl, InputLabel, Input, FormHelperText, Typography, IconButton, Button, Tooltip
} from '@material-ui/core';
import { DialogForm } from "../../../components";
import Edit from '@material-ui/icons/Edit';

class MidnightTradeForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      saved: false,
      saving: false
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.close = this.close.bind(this);
    this.points = React.createRef();
    this.remove = this.remove.bind(this);
  }

  remove() {
    Promise.resolve(this.close()).then(this.props.remove);
  }

  close() {
    this.setState({open: false});
  }

  handleSubmit(event) {
    event.preventDefault();
    let typeObj = {
      pointsOffered: this.points.current.value,
      _id: this.props.trade._id
    };
    this.setState({saving: true});
    this.props.submit(typeObj).then((valid) => {
      if (valid && !this.props.submitTriggersClose) {
        this.setState({saving: false, saved: true});
        this.timeout = setTimeout(() => this.setState({saved: false}), 2000)
      } else if (valid && this.props.submitTriggersClose) {
        this.close();
      }
    })
  }

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  render() {
    let midnight = this.props.trade.midnight;
    return (
      <Fragment>
        <Tooltip title={"Edit/remove the offer"}>
        <IconButton variant={"outlined"} onClick={()=>this.setState({open: true})}><Edit /></IconButton>
        </Tooltip>
        <DialogForm open={this.state.open} close={this.close} saved={this.state.saved}
                    saving={this.state.saving} handleSubmit={this.handleSubmit}
                    title={"Review Midnight"}>
          <Fragment>
            <Typography
              variant="subheading">{midnight.date.slice(0, 10)} {midnight.task.name}: {midnight.account.zebe.name} ({midnight.account.zebe.kerberos})</Typography>
            <FormControl fullWidth margin="dense">
              <InputLabel>Additional Points to Offer</InputLabel>
              <Input inputRef={this.points} type="number" required
                     defaultValue={this.props.trade.pointsOffered}/>
              <FormHelperText>Can be negative (for punts)</FormHelperText>
            </FormControl>
            { this.props.remove ? <FormControl fullWidth margin="dense">
              <Button variant="raised" color="secondary" onClick={this.remove}>Remove Offer</Button>
            </FormControl> : null}
          </Fragment>
        </DialogForm>
      </Fragment>
    )
  }
}

MidnightTradeForm.propTypes = {
  submitTriggersClose: PropTypes.bool,
  submit: PropTypes.func.isRequired,
  trade: PropTypes.object.isRequired,
  remove: PropTypes.func.isRequired,
};

export default MidnightTradeForm;