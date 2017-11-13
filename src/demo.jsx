/* tabletable - Copyright 2016 Zeroarc Software, LLC
 *
 * Demo top level component.
 */

'use strict';

// External
const React = require('react');
const ReactDOM = require('react-dom');
const Immutable = require('immutable');

// Local
import Tabletable from './Container';
import fakeData from '../test/fake_data.json';


class Demo extends React.Component<*> {
  render() {
    let immutableData = Immutable.fromJS(fakeData);

    let columnDefs = [
      {
        display: 'Index',
        headerCssClass: 'col-sm-1',
        visible: true,
        data: (row,index,context) => <div>{index}</div>,
      },
      {
        display: 'Name',
        headerCssClass: 'col-sm-4',
        data: row => <div>{row.get('name')}</div>,
      },
      {
        display: 'Skill',
        headerCssClass: 'col-sm-4',
        data: row => <div>{row.get('skill')}</div>,
      },
      {
        display: 'Favorite Color',
        headerCssClass: 'col-sm-3',
        data: row => <div>{row.get('color')}</div>,
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
