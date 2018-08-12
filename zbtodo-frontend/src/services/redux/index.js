import React, {Component} from 'react';
import store from "./store";
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import {PersistGate} from 'redux-persist/integration/react';
import * as Actions from './actions';

const persistor = persistStore(store);

class BaseProvider extends Component {
  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          {this.props.children}
        </PersistGate>
      </Provider>
    )
  }
}

export { Actions }
export default BaseProvider;