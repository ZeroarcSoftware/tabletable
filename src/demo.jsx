/* tabletable - Copyright 2016 Zeroarc Software, LLC
 *
 * Demo top level component.
 */

'use strict';

// External
let React = require('react');
let ReactDOM = require('react-dom');
let ReactShallowCompare = require('react-addons-shallow-compare');
let Immutable = require('immutable');
let Autobind = require('autobind-decorator');

// Local
import Tabletable from './Container';
import fakeData from '../test/fake_data.json';


@Autobind
class Demo extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return ReactShallowCompare(this, nextProps, nextState);
  }

  render() {
    let immutableData = Immutable.fromJS(fakeData).toSeq();

    let columnDefs = {
      index: {
        display: 'Index',
        headerCssClass: 'col-sm-1',
        visible: true,
        data: (row,index,context) => <div>{index}</div>,
      },
      name: {
        display: 'Name',
        headerCssClass: 'col-sm-4',
        data: row => <div>{row.get('name')}</div>,
      },
      skill: {
        display: 'Skill',
        headerCssClass: 'col-sm-4',
        data: row => <div>{row.get('skill')}</div>,
      },
      color: {
        display: 'Favorite Color',
        headerCssClass: 'col-sm-3',
        data: row => <div>{row.get('color')}</div>,
      }
    };

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
