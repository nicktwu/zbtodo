import React, {Component} from 'react';
import PropTypes from 'prop-types';
import SpeedDialAction from './CustomSpeedDialAction';
import AdminButtonSet from "./AdminButtonSet";


class AdminWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      forms: (new Array(this.props.forms.length)).fill(false),
      speedDial: false
    };
    this.openSetting = this.openSetting.bind(this);
    this.closeSetting = this.closeSetting.bind(this);
  }

  openSetting(idx) {
    return () => {
      let newFormStates = this.state.forms.slice();
      newFormStates[idx] = true;
      this.setState({forms: newFormStates})
    };
  }

  closeSetting(idx) {
    return () => {
      let newFormStates = this.state.forms.slice();
      newFormStates[idx] = false;
      if (this.props.postClose) {
        this.props.postClose();
      }
      this.setState({forms: newFormStates})
    };
  }

  render() {
    if (!this.props.show) {
      return this.props.children
    }
    return (
        <React.Fragment>
          { this.props.forms.map((form, idx) => {
            return React.cloneElement(form.content, {
              key: idx,
              open: this.state.forms[idx],
              close: this.closeSetting(idx)
            });
          })}
          { this.props.children }
          <AdminButtonSet onClose={() => this.setState({speedDial: false})} hidden={false}
                          onOpen={()=>this.setState({speedDial: true})} open={this.state.speedDial}>
            { this.props.forms.map((form, idx) => {
              return <SpeedDialAction key={idx} onClick={this.openSetting(idx)} icon={form.icon}
                                      tooltipTitle={form.tooltipTitle} tooltipPlacement={"top"}/>
            })}
          </AdminButtonSet>
        </React.Fragment>
    )
  }
}

AdminWrapper.propTypes = {
  show: PropTypes.bool,
  forms: PropTypes.arrayOf(PropTypes.shape({
    content: PropTypes.element.isRequired,
    icon: PropTypes.node.isRequired,
    tooltipTitle: PropTypes.string.isRequired
  })).isRequired,
  children: PropTypes.node.isRequired,
  postClose: PropTypes.func,
};

export default AdminWrapper