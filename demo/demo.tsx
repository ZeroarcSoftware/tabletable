/* tabletable - Copyright 2016 Zeroarc Software, LLC
 *
 * Demo top level component.
 */

'use strict';

// External
import React from 'react';
import ReactDOM from 'react-dom';


// Local
import Tabletable from './Container';
import fakeData from '../test/fake_data.json';
import { Row, Context, Column } from './ts_types';


class Demo extends React.Component {
  render() {
    let immutableData = fromJS(fakeData);

    let columnDefs:Array<Column> = [
      {
        display: 'Index',
        headerCssClass: 'col-sm-1',
        visible: true,
        data: (row: Row, index: number, context: Context) => <div>{index}</div>,
      },
      {
        display: 'Name',
        headerCssClass: 'col-sm-4',
        data: (row: Row) => <div>{row.get('name')}</div>,
      },
      {
        display: 'Skill',
        headerCssClass: 'col-sm-4',
        data: (row: Row) => <div>{row.get('skill')}</div>,
      },
      {
        display: 'Favorite Color',
        headerCssClass: 'col-sm-3',
        data: (row: Row) => <div>{row.get('color')}</div>,
      }
    ];

    return (
      <Tabletable
        data={immutableData}
        columns={columnDefs}
        pagerSize={5}
        rowsPerPage={10}
      />
    );
  }

  //
  // Custom methods
  //
}

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Demo />
    , document.getElementById('tabletable_example')
  );
});
