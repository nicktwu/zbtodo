import {createMuiTheme, MuiThemeProvider, CssBaseline} from '@material-ui/core'
import React, {Component} from 'react';

const theme = createMuiTheme({
  palette: {
    type: "dark",
  },
  spacing: {
    pad: 24,
  }
});

class ThemeProvider extends Component {
  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <React.Fragment>
          <CssBaseline />
          {this.props.children}
        </React.Fragment>
      </MuiThemeProvider>
    )
  }
}

export default ThemeProvider