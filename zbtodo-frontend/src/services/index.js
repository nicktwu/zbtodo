import React, {Component} from 'react';
import Router from "./router";
import getReduxProvider from "./redux";
import { CookiesProvider } from 'react-cookie';
import ThemeProvider from './theme';

export default (reducers) => {
  let Redux = getReduxProvider(reducers);
  class BaseServices extends Component {
    render() {
      return (
        <Redux>
          <CookiesProvider>
            <ThemeProvider>
              <Router basename={"/todo"}>
                {this.props.children}
              </Router>
            </ThemeProvider>
          </CookiesProvider>
        </Redux>
      )
    }
  }
  return BaseServices
}
