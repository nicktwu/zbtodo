import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  FormControl, InputLabel, Input, FormHelperText, Typography,
} from '@material-ui/core';
import { DialogForm } from "../../../components";

class MidnightReviewForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      saved: false,
      saving: false,
      points: props.midnight.reviewed ? props.midnight.awarded : props.midnight.potential,
      comment: props.midnight.reviewed ? props.midnight.feedback : ""
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    let typeObj = {
      feedback: this.state.comment,
      awarded: this.state.points,
      reviewed: true,
      _id: this.props.midnight._id
    };
    this.setState({saving: true});
    this.props.submit(typeObj).then((valid) => {
      if (valid && !this.props.submitTriggersClose) {
        this.setState({saving: false, saved: true});
        this.timeout = setTimeout(() => this.setState({saved: false}), 2000)
      } else if (this.props.submitTriggersClose) {
        this.props.close();
      }
    })
  }

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  render() {
    return (
      <DialogForm open={this.props.open} close={this.props.close} saved={this.state.saved}
                  saving={this.state.saving} handleSubmit={this.handleSubmit}
                  title={"Review Midnight"} >
        <React.Fragment>
          <Typography variant="subheading">{this.props.midnight.date.slice(0,10)} {this.props.midnight.task.name}: {this.props.midnight.account.zebe.name} ({this.props.midnight.account.zebe.kerberos})</Typography>
          { this.props.midnight.note ? <Typography gutterBottom variant="body1">Note: { this.props.midnight.note }</Typography>: null }
          <FormControl fullWidth margin="dense" error={this.state.numberError}>
            <InputLabel>Points Awarded</InputLabel>
            <Input value={this.state.points} onChange={(evt) => this.setState({points: evt.target.value})} type="number"
                   required/>
            <FormHelperText>Can be negative (for punts)</FormHelperText>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Comments</InputLabel>
            <Input multiline value={this.state.comment} onChange={evt=>this.setState({comment:evt.target.value})}/>
          </FormControl>
        </React.Fragment>
      </DialogForm>
    )
  }
}

MidnightReviewForm.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func,
  submitTriggersClose: PropTypes.bool,
  submit: PropTypes.func.isRequired,
  midnight: PropTypes.object.isRequired,
};

export default MidnightReviewForm;