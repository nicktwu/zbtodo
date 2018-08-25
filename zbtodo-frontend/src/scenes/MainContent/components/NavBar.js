import React, {Component} from 'react';
import {AppBar, Toolbar, Drawer, Typography, Button, IconButton,
  List, withStyles, Hidden, Grid
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import PropTypes from 'prop-types';
import {Link, Redirect, Route} from "react-router-dom";


const drawerWidth = 240;

const styles = (theme) => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  container: {
    flexGrow: 1,
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
  },
  drawerPaper: {
    position: 'relative',
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    minWidth: 0, // So that Typography noWrap works
  },
  flex: {
    flexGrow: 1,
  },
  linkBox: {
    textDecoration: "none"
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
    display: "flex"
  },
  noflex: {
    flexGrow: 0,
  },
  flexContent: {
    flexGrow: 1,
    display: "flex"
  }
});

class NavBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      logout: false,
      mobileOpen: false
    };
    this.logout = this.logout.bind(this);
    this.handleDrawerToggle = this.handleDrawerToggle.bind(this);
  }

  handleDrawerToggle() {
    this.setState(state => ({ mobileOpen: !state.mobileOpen }));
  };

  logout() {
    this.setState({logout: true})
  }

  render() {
    if (this.state.logout) {
      return <Redirect to={this.props.logoutPath}/>
    }
    return (
      <div className={this.props.classes.container}>
        <AppBar position={"fixed"} className={this.props.classes.appBar}>
          <Toolbar>
            <Hidden mdUp>
              <IconButton className={this.props.classes.menuButton} color="inherit" onClick={this.handleDrawerToggle}>
                <MenuIcon />
              </IconButton>
            </Hidden>
            <Typography variant="title" className={this.props.classes.flex}>ZBTodo</Typography>
            <Button color="inherit" onClick={this.logout}>Logout</Button>
          </Toolbar>
        </AppBar>
        <Hidden smDown>
          <Drawer variant="permanent" classes={{
            paper: this.props.classes.drawerPaper,
          }}>
            <Toolbar/>
            <List>
              {this.props.sceneList.map((scene, idx) => {
                let NavComp = scene.nav;
                return (
                  <Link to={this.props.basePath + scene.route} key={idx}
                        className={this.props.classes.linkBox}>
                    <Route path={this.props.basePath + scene.route}>
                      {({match}) => (
                        <NavComp active={!!match}/>
                      )}
                    </Route>
                  </Link>
                )
              })}
            </List>
          </Drawer>
        </Hidden>
        <Hidden mdUp>
          <Drawer variant="temporary" open={this.state.mobileOpen} anchor="left"
                  onClose={this.handleDrawerToggle} classes={{
            paper: this.props.classes.drawerPaper,
          }}>
            <List>
              {this.props.sceneList.map((scene, idx) => {
                let NavComp = scene.nav;
                return (
                  <Link to={this.props.basePath + scene.route} key={idx}
                        className={this.props.classes.linkBox}>
                    <Route path={this.props.basePath + scene.route}>
                      {({match}) => (
                        <NavComp active={!!match}/>
                      )}
                    </Route>
                  </Link>
                )
              })}
            </List>
          </Drawer>
        </Hidden>
        <Grid className={this.props.classes.content} component="main" container direction="column" alignItems="stretch">
          <Grid item className={this.props.classes.noflex}>
            <Toolbar/>
          </Grid>
          <Grid item className={this.props.classes.flexContent}>
            {this.props.children}
          </Grid>
        </Grid>
      </div>
    )
  }
}

NavBar.propTypes = {
  logoutPath: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
  sceneList: PropTypes.array.isRequired,
  children: PropTypes.element.isRequired,
  basePath: PropTypes.string.isRequired
};


export default withStyles(styles)(NavBar);
