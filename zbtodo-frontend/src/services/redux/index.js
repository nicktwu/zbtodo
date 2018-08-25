import React, {Component} from 'react';
import getStore from "./store";
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import {PersistGate} from 'redux-persist/integration/react';

const getReduxProvider = (reducers) => {
  let store = getStore(reducers);
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
  return BaseProvider
};

export default getReduxProvider;