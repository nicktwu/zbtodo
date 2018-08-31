import React from 'react';
import PropTypes from 'prop-types';
import { Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';

const GenericTable = ({ tableProps, tableHeaders, tableContent, tableFields, getTableRowProps, getFields }) => {
  tableProps = tableProps ? tableProps : {};
  getTableRowProps = getTableRowProps ? getTableRowProps : () => ({});
  return (
    <Table {...tableProps}>
      <TableHead>
        <TableRow>
          { tableHeaders.map((header, idx) => (
            <TableCell key={idx}>{header}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        { tableContent.map((content, idx) => (
          <TableRow {...getTableRowProps(content)} key={idx}>
            { tableFields ? tableFields.map((field, idx) => (
              <TableCell key={idx}>{content[field]}</TableCell>
            )) : getFields(content, idx).map((val, idx) => (
              <TableCell key={idx}>{val}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
};

GenericTable.propTypes = {
  tableHeaders: PropTypes.array.isRequired,
  tableProps: PropTypes.object,
  tableContent: PropTypes.array.isRequired,
  tableFields: PropTypes.array,
  getFields: PropTypes.func,
  getTableRowProps: PropTypes.func
};

export default GenericTable;