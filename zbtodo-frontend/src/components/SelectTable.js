import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {
  Dialog, Table, TableHead, TableBody, TableRow, TableCell, TablePagination, Checkbox,
} from '@material-ui/core';
import TableToolbar from './TableToolbar';

class SelectTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: new Array(props.contentList.length).fill(false),
      numSelected: 0,
      page: 0,
      rowsPerPage: 5,
      saving: false,
      saved: false
    };
    this.selectAll = this.selectAll.bind(this);
    this.selectIdx = this.selectIdx.bind(this);
    this.handleAction = this.handleAction.bind(this);
    this.handleChangePage = this.handleChangePage.bind(this);
    this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this);
    this.closeSelf = this.closeSelf.bind(this);
  }

  closeSelf() {
    this.setState({
      selected: new Array(this.props.contentList.length).fill(false),
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
      selected: new Array(this.props.contentList.length).fill(!allSelected),
      numSelected: allSelected ? 0 : this.props.contentList.length
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

  handleAction() {
    this.setState({saving: true});
    this.props.handleAction(
      this.props.contentList
        .filter((person, idx) => this.state.selected[idx])
        .map(person => person._id)
    ).then((result) => {
      if (result) {
        this.setState({saving: false, saved: true,
          selected: new Array(this.props.contentList.length).fill(false),
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
    if (props.contentList.length !== state.selected.length) {
      return {
        selected: new Array(props.contentList.length).fill(false),
        numSelected: 0
      }
    } else {
      return {}
    }
  };

  render() {
    let emptyRowCount = this.state.rowsPerPage - Math.min(this.state.rowsPerPage, this.props.contentList.length - this.state.page*this.state.rowsPerPage);

    return (
      <Dialog open={this.props.open} onClose={this.closeSelf}>
        <TableToolbar numSelected={this.state.numSelected} saved={this.state.saved}
                      title={this.props.title} tooltipTitle={this.props.tooltipTitle}
                      icon={this.props.icon} handleClose={this.closeSelf}
                      handleAction={this.handleAction} red={this.props.red}/>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding={"checkbox"}>
                <Checkbox indeterminate={this.state.numSelected > 0 && this.state.numSelected < this.props.contentList.length}
                          checked={this.state.numSelected === this.props.contentList.length} onChange={this.selectAll}/>
              </TableCell>
              { this.props.fieldHeaders.map((header, idx) => (
                <TableCell key={idx}>
                  { header }
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            { this.props.contentList
              .slice(this.state.page * this.state.rowsPerPage, (this.state.page + 1) * this.state.rowsPerPage)
              .map((content, idx) => {
                return (
                  <TableRow key={idx} onClick={this.selectIdx(idx)}>
                    <TableCell>
                      <Checkbox checked={this.state.selected[this.state.rowsPerPage*this.state.page + idx]}/>
                    </TableCell>
                    { (this.props.fieldNames ? this.props.fieldNames : this.props.getField(content) ).map((name, idx) => (
                      <TableCell key={name + idx.toString()}>
                        {this.props.fieldNames ? content[name] : name}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })}
            { emptyRowCount > 0 ? (
              <TableRow style={{height: 49*emptyRowCount}}>
                <TableCell colSpan={this.props.fieldHeaders.length + 1} />
              </TableRow>
            ): null}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={this.props.contentList.length}
          rowsPerPage={this.state.rowsPerPage}
          page={this.state.page}
          onChangePage={this.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
      </Dialog>
    )
  }
}

SelectTable.propTypes = {
  open: PropTypes.bool,
  icon: PropTypes.node.isRequired,
  close: PropTypes.func,
  contentList: PropTypes.array.isRequired,
  fieldHeaders: PropTypes.array.isRequired,
  fieldNames: PropTypes.array,
  getField: PropTypes.func,
  handleAction: PropTypes.func.isRequired,
  red: PropTypes.bool,
  title: PropTypes.string.isRequired,
  tooltipTitle: PropTypes.string.isRequired
};

export default SelectTable;