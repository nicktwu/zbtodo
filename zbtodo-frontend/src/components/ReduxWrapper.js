import {connect} from 'react-redux';

const ReduxWrapper = (Actions, State) => {
  return (component) => ((PREFIX, NAME) => {
    let mapDispatchToProps = (dispatch) => Object.keys(Actions).reduce(((previousValue, currentValue) => ({
      ...previousValue, [currentValue]: (...args) => dispatch(Actions[currentValue](PREFIX)(...args))
    })), {});
    let mapStateToProps = (state) => Object.keys(State).reduce(((previousValue, currentValue) => ({
      ...previousValue, [currentValue]: state[NAME][State[currentValue]]
    })), {});
    return connect( mapStateToProps, mapDispatchToProps )(component)
  })
};

export default ReduxWrapper