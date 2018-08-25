import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  Dialog, Table, TableHead, TableBody, TableRow, TableCell, TablePagination, Checkbox,
  withStyles,
  Toolbar, IconButton, Tooltip,
  Typography
} from '@material-ui/core';
import { lightGreen } from '@material-ui/core/colors'
import { Done } from '@material-ui/icons';

const toolbarStyles = (theme) => ({
  title: {
    flex: "0 0 auto"
  },
  highlight: {
    color: theme.palette.text.primary,
    backgroundColor: lightGreen[800],
    paddingRight: theme.spacing.unit
  },
  spacer: {
    flex: "1 1 100%"
  },
  actions: {
    color: theme.palette.text.secondary
  },
  saved: {
    color: theme.palette.text.primary,
    backgroundColor: lightGreen[900]
  }
});

class TableToolbar extends Component {
  render() {
    return (
      <Toolbar className={this.props.saved ? this.props.classes.saved : this.props.numSelected > 0 ? this.props.classes.highlight : null}>
        <div className={this.props.classes.title}>
          { this.props.saved ? (
            <Typography color="inherit" variant="subheading">
              Saved
            </Typography>
          ) : (this.props.numSelected > 0 ? (
            <Typography color="inherit" variant="subheading">
              {this.props.numSelected} selected
            </Typography>
          ) : (
            <Typography variant="title">
              Reactivate Zebes
            </Typography>
          )) }
        </div>
        <div className={this.props.classes.spacer} />
        <div className={this.props.classes.actions}>
          { this.props.saved ? null : this.props.numSelected > 0 ? <Tooltip title="Reactivate members" placement="left">
            <IconButton onClick={this.props.handleReactivate}>
              <Done />
            </IconButton>
          </Tooltip> : null}
        </div>
      </Toolbar>
    )
  }
}

TableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  handleReactivate: PropTypes.func.isRequired,
  saved: PropTypes.bool,
};

const StyledTableToolbar = withStyles(toolbarStyles)(TableToolbar);

class ReactivateZebes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: new Array(props.personList.length).fill(false),
      numSelected: 0,
      page: 0,
      rowsPerPage: 5,
      saving: false,
      saved: false
    };
    this.selectAll = this.selectAll.bind(this);
    this.selectIdx = this.selectIdx.bind(this);
    this.handleReactivate = this.handleReactivate.bind(this);
    this.handleChangePage = this.handleChangePage.bind(this);
    this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this);
    this.closeSelf = this.closeSelf.bind(this);
  }

  closeSelf() {
    this.setState({
      selected: new Array(this.props.personList.length).fill(false),
      numSelected: 0,
      page: 0,
      rowsPerPage: 5,
      saving: false,
      saved: false
    });
    this.props.close();
  }

  selectAll() {
    let allSelected = this.state.selected.every(v=>v);
    this.setState({
      selected: new Array(this.props.personList.length).fill(!allSelected),
      numSelected: allSelected ? 0 : this.props.personList.length
    })
  }

  selectIdx(idx) {
    return () => {
      let i = idx + this.state.page*this.state.rowsPerPage;
      let newSelected = this.state.selected.slice();
      newSelected.splice(i, 1, !this.state.selected[i]);
      let newNumSelected = this.state.numSelected;
      if (this.state.selected[i]) {
        // was selected, now unselected:
        newNumSelected = newNumSelected - 1
      } else {
        // was unselected, now selected
        newNumSelected = newNumSelected + 1
      }
      this.setState({selected: newSelected, numSelected: newNumSelected});
    }
  }

  handleChangePage(event, page) {
    this.setState({ page })
  }

  handleChangeRowsPerPage(event) {
    this.setState({ rowsPerPage: event.target.value})
  }

  handleReactivate() {
    this.setState({saving: true});
    this.props.handleReactivate(
      this.props.personList
        .filter((person, idx) => this.state.selected[idx])
        .map(person => person._id)
    ).then((result) => {
      if (result) {
        this.setState({saving: false, saved: true,
          selected: new Array(this.props.personList.length).fill(false),
          numSelected: 0,
        });
        // display a brief saved message at the top
        this.timeout = setTimeout(()=>{this.setState({saved: false})}, 1500)
      }
    })
  }

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.personList.length !== state.selected.length) {
      return {
        selected: new Array(props.personList.length).fill(false),
        numSelected: 0
      }
    } else {
      return {}
    }
  };

  render() {
    let emptyRowCount = this.state.rowsPerPage - Math.min(this.state.rowsPerPage, this.props.personList.length - this.state.page*this.state.rowsPerPage);

    return (
      <Dialog open={this.props.open} onClose={this.closeSelf}>
        <StyledTableToolbar numSelected={this.state.numSelected} saved={this.state.saved}
                            handleReactivate={this.handleReactivate}/>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding={"checkbox"}>
                <Checkbox indeterminate={this.state.numSelected > 0 && this.state.numSelected < this.props.personList.length}
                          checked={this.state.numSelected === this.props.personList.length} onChange={this.selectAll}/>
              </TableCell>
              <TableCell>
                Name
              </TableCell>
              <TableCell>
                Kerberos
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            { this.props.personList
              .slice(this.state.page * this.state.rowsPerPage, (this.state.page + 1) * this.state.rowsPerPage)
              .map((person, idx) => {
                return (
                  <TableRow key={person._id} onClick={this.selectIdx(idx)}>
                    <TableCell>
                      <Checkbox checked={this.state.selected[this.state.rowsPerPage*this.state.page + idx]}/>
                    </TableCell>
                    <TableCell>
                      {person.name}
                    </TableCell>
                    <TableCell>
                      {person.kerberos}
                    </TableCell>
                  </TableRow>
                )
              })}
            { emptyRowCount > 0 ? (
              <TableRow style={{height: 49*emptyRowCount}}>
                <TableCell colSpan={3} />
              </TableRow>
            ): null}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={this.props.personList.length}
          rowsPerPage={this.state.rowsPerPage}
          page={this.state.page}
          onChangePage={this.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
      </Dialog>
    )
  }
}

ReactivateZebes.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func.isRequired,
  personList: PropTypes.array.isRequired,
  handleReactivate: PropTypes.func.isRequired
};

export default ReactivateZebes;