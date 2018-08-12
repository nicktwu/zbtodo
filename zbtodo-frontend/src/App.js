import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Services from "./services";
import {Authentication} from "./scenes";

class Content extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo"/>
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        { this.props.loggedIn ? <button onClick={this.props.logout}>Logout</button> : <button onClick={this.props.login}>Login</button>}
      </div>
    )
  }
}

class App extends Component {
  render() {
    return (
      <Services>
        <Authentication>
          <Content />
        </Authentication>
      </Services>
    );
  }
}

export default App;
