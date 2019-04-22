//@flow
// tabletable - Copyright 2017 Zeroarc Software, LLC
'use strict';

import React from 'react';
import Immutable from 'immutable';
import ClassNames from 'classnames';
import Autobind from 'autobind-decorator';

// Local
import Pager from './Pager';
import type { Data, Columns, Row, Context } from './types';

type Props = {
  columns: Columns,
  data: Data,
  filterValue?: string,
  rowsPerPage: number,
  pagerSize: number,
  showPager: bool,
  showFilter: bool,
  // Optional
  rowContext?: (Row,number) => any,
  rowCssClass?: (Row,number,Context) => string,
  pager?: any, // TODO WTH is the type for this
  onFilterAction?: (string) => void,
  onSearch?: () => void,
  // filterValue?: string,
  currentPage?: number,
  onPageChange?: (page: number) => void,
}

type State = {
  currentPage: number,
  filterValue: string,
}


@Autobind
export default class TabletableContainer extends React.Component<Props, State> {
  static defaultProps: {
    rowsPerPage: number,
    pagerSize: number,
    showPager: bool,
    showFilter: bool,
  }

  constructor(props: Props) {
    super(props);

    this.state = {
      currentPage: this.props.currentPage || 1,
      filterValue: this.props.filterValue || '',
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.currentPage !== prevProps.currentPage) {
      this.setState({currentPage: this.props.currentPage});
    }
  }

  render() {
    if (!Immutable.isImmutable(this.props.data)) {
      console.error('Invalid prop data supplied to TableTable. Expected Immutable iterable.');
      return (<div>INVALID DATA</div>);
    }

    let headerComponents = [];

    this.props.columns.forEach((col,i) => {
      // If visible is false, hide the column. If visible is not defined, default to showing column
      if (typeof col.visible === 'undefined' || col.visible) {
        headerComponents.push(
          <th key={`th-${i}`} className={col.headerCssClass}>{col.display || ''}</th>
        );
      }
    });

    const skipRows: number = this.props.rowsPerPage * (this.state.currentPage - 1);
    const takeRows: number = Math.min(this.props.rowsPerPage, this.props.data.count() - skipRows);

    const rows = this.props.data.skip(skipRows).take(takeRows).map((row,index) => {
      // Create row context if required. Make it an immutable so nobody tries to abuse it by shoving stuff into it
      // during a column step. We will re-project from the Immutable each time it is used
      const context = Immutable.fromJS(this.props.rowContext ? this.props.rowContext(row,index) : {});

      // Assign any row classes
      let rowCssClass = this.props.rowCssClass;
      if (typeof this.props.rowCssClass === 'function') {
        rowCssClass = this.props.rowCssClass(row,index,context && context.toObject());
        if (typeof rowCssClass !== 'string') console.error('rowCssClass function must return a string value. Was ' + typeof rowCssClass);
      }

      // Build out components for the row
      let rowComponents = [];
      this.props.columns.forEach((col,i) => {
        // If visible is false, hide the column. If visible is not defined, default to showing column
        if (typeof col.visible === 'undefined' || col.visible) {
          // elementCssClass can either be a string or a function that returns a string
          let elementCssClass = col.elementCssClass;
          if (typeof col.elementCssClass === 'function') {
            elementCssClass = col.elementCssClass(row,index,context && context.toObject());
            if (typeof elementCssClass !== 'string') console.error('elementCssClass function must return a string value. Was ' + typeof elementCssClass);
          }

          rowComponents.push(
            <td key={`${index}-${i}`} className={elementCssClass}>{col.data(row,index,context && context.toObject())}</td>
          );
        }
      });

      return (
        <tr key={index} className={rowCssClass}>
          {rowComponents}
        </tr>
      );
    });

    // Setup pager
    const totalPages: number = Math.ceil(this.props.data.count() / this.props.rowsPerPage);

    let pager: null | React$Element<{currentPage: number, displayPages: number, maxPage: number, onPageChange: (pageNumber: number) => void}> = null;

    if (this.props.showPager) {
      // Check for custom pager and use it
      if (this.props.pager) {
        pager = React.createElement(this.props.pager, {
          onPageChange: this.handlePageChange,
          displayPages: this.props.pagerSize,
          maxPage: totalPages,
          currentPage: this.state.currentPage,
        });
      }
      else {
        // Use default pager
        pager = <Pager onPageChange={this.handlePageChange}
          displayPages={this.props.pagerSize}
          maxPage={totalPages}
          currentPage={this.state.currentPage} />
      }
    }

    // Hide filter unless we have a search handler and showFilter is true
    const filterClasses = ClassNames({
      hidden: !this.props.onFilterAction || !this.props.showFilter
    });

    const filterButtonClasses = ClassNames('btn btn-white', {
      hidden: !this.props.onFilterAction,
      hidden: !this.props.showFilter,
      hidden: !this.props.onSearch,
    });

    const clearClasses: string = ClassNames('btn', 'btn-white', 'btn-xs', {
      // hidden: !this.props.filterValue || this.props.filterValue.length === 0
    });

    const filterControl = this.props.showFilter
      ? <div className={filterClasses}>
        <div className='input-group col-xs-4 col-xs-offset-8'>
          <button className={clearClasses} style={{position: 'absolute', right: '45px', top: '6px', zIndex: 10}} onClick={this.handleClearFilterClick}>
            <i className='fa fa-times'></i> Clear
          </button>
          <input type='text' className='form-control' placeholder='Type to filter' value={this.state.filterValue} onChange={this.handleFilterChange} onKeyPress={this.handleKeyPress} />
          <span className="input-group-btn">
            <button className={filterButtonClasses} onClick={this.handleSearchClick}>
              <i className='fa fa-search'></i>
            </button>
          </span>
        </div>
      </div>
      : '';

    return (
      <div className='tabletable'>
        {filterControl}
        {pager}
        <table className='table table-striped table-bordered table-hover'>
          <thead>
            <tr>
              {headerComponents}
            </tr>
          </thead>
          <tbody>
            {rows.toList()}
          </tbody>
        </table>
        {pager}
      </div>
    );
  };

  //
  // Custom methods
  //

  handlePageChange(pageNumber: number) {
    if (this.props.onPageChange) {
      this.props.onPageChange(pageNumber);
    }
    else {
      this.setState({currentPage: pageNumber});
    }
  }

  // Update local state and call external onFilterAction if defined
  handleFilterChange(e: SyntheticInputEvent<*>) {
    e.stopPropagation();
    this.setState({filterValue: e.target.value});
    this.props.onFilterAction && this.props.onFilterAction(e.target.value);
  }

  // Call external onSearch if pased
  handleSearchClick(e: SyntheticInputEvent<*>) {
    e.stopPropagation();
    this.props.onSearch && this.props.onSearch();
  }

  handleClearFilterClick(e: SyntheticInputEvent<*>) {
    e.preventDefault();
    // Reset to first page to re-orient user
    this.setState({currentPage: 1, filterValue: ''});
    this.props.onFilterAction && this.props.onFilterAction('');
    this.props.onSearch && this.props.onSearch();
  }

  handleKeyPress(e: SyntheticKeyboardEvent<*>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.setState({currentPage: 1});
      this.props.onSearch && this.props.onSearch();
    }
  }
}

TabletableContainer.defaultProps = {
  rowsPerPage: 5,
  pagerSize: 10,
  showPager: true,
  showFilter: false,
};