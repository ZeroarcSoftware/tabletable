// Tabletable - Copyright 2017 Zeroarc Software, LLC
'use strict';

import React, { ReactElement, SyntheticEvent } from 'react';
import Immutable from 'immutable';
import ClassNames from 'classnames';
import Autobind from 'autobind-decorator';

// Local
import Pager from './Pager';
import { Data, Columns, Row, Context } from './ts_types';

type Props = {
  columns: Columns,
  containerCssClass: string,
  data: Data,
  pagerSize: number,
  rowsPerPage: number,
  showFilter: boolean,
  showPager: boolean,
  tableCssClass: string,

  // Optional
  currentPage?: number,
  filterValue?: string,
  pager?: any, // TODO WTH is the type for this
  onClear?: () => void,
  onSearch?: (searchText: string) => void,
  onPageChange?: (page: number) => void,
  rowContext?: (Row, number) => any,
  rowCssClass?: (Row, number, Context) => string,
  showSpinner?: boolean,
  spinner?: any,
  totalRows?: number,
}

type State = {
  currentPage: number,
  filterValue: string,
}


@Autobind
export default class TabletableContainer extends React.PureComponent<Props, State> {
  static defaultProps: {
    containerCssClass: string,
    pagerSize: number,
    showPager: boolean,
    showFilter: boolean,
    tableCssClass: string,
    rowsPerPage: number,
  }

  constructor(props: Props) {
    super(props);

    this.state = {
      currentPage: this.props.currentPage || 1,
      filterValue: this.props.filterValue || '',
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (!this.props.currentPage) return;

    if (this.props.currentPage !== prevProps.currentPage)
      this.setState({ currentPage: this.props.currentPage });

    if (this.props.filterValue !== prevProps.filterValue)
      this.setState({ filterValue: this.props.filterValue });
  }

  render() {
    if (!Immutable.isImmutable(this.props.data)) {
      console.error('Invalid prop data supplied to TableTable. Expected Immutable iterable.');
      return (<div>INVALID DATA</div>);
    }

    let headerComponents = [];

    this.props.columns.forEach((col, i) => {
      // If visible is false, hide the column. If visible is not defined, default to showing column
      if (typeof col.visible === 'undefined' || col.visible) {
        headerComponents.push(
          <th key={`th-${i}`} className={col.headerCssClass}>{col.display || ''}</th>
        );
      }
    });

    // If totalRows prop has been passed, then we are not using built in paging. Do not skip any rows.
    let skipRows = 0;
    if (!this.props.totalRows)
      skipRows = this.props.rowsPerPage * (this.state.currentPage - 1);

    const takeRows: number = Math.min(this.props.rowsPerPage, this.props.data.size - skipRows);

    const rows = this.props.data.skip(skipRows).take(takeRows).map((row, index) => {
      // Create row context if required. Make it an immutable so nobody tries to abuse it by shoving stuff into it
      // during a column step. We will re-project from the Immutable each time it is used
      const context = Immutable.fromJS(this.props.rowContext ? this.props.rowContext(row, index) : {});

      // Assign any row classes
      let rowCssClass = this.props.rowCssClass;
      if (typeof this.props.rowCssClass === 'function') {
        rowCssClass = this.props.rowCssClass(row, index, context && context.toObject());
        if (typeof rowCssClass !== 'string') console.error('rowCssClass function must return a string value. Was ' + typeof rowCssClass);
      }

      // Build out components for the row
      let rowComponents = [];
      this.props.columns.forEach((col, i) => {
        // If visible is false, hide the column. If visible is not defined, default to showing column
        if (typeof col.visible === 'undefined' || col.visible) {
          // elementCssClass can either be a string or a function that returns a string
          let elementCssClass = col.elementCssClass;
          if (typeof col.elementCssClass === 'function') {
            elementCssClass = col.elementCssClass(row, index, context && context.toObject());
            if (typeof elementCssClass !== 'string') console.error('elementCssClass function must return a string value. Was ' + typeof elementCssClass);
          }

          rowComponents.push(
            <td key={`${index}-${i}`} className={elementCssClass}>{col.data(row, index, context && context.toObject())}</td>
          );
        }
      });

      return (
        <tr key={index} className={rowCssClass}>
          {rowComponents}
        </tr>
      );
    });

    // Setup pager. If totalRows has been populated, use that, otherwise count passed in data
    const totalRows = this.props.totalRows ? this.props.totalRows : this.props.data.size;

    const totalPages: number = Math.ceil(totalRows / this.props.rowsPerPage);

    let pager: null | ReactElement<{ currentPage: number, displayPages: number, maxPage: number, onPageChange: (pageNumber: number) => void }> = null;

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
    const filterClasses = ClassNames('col-4 justify-content-end', {
      'd-none': !this.props.showFilter
    });

    const filterButtonClasses = ClassNames('btn btn-outline-secondary', {
      'd-none': !this.props.showFilter,
      'd-none': !this.props.onSearch,
    });

    const clearClasses: string = ClassNames('btn', 'btn-outline-secondary', 'btn-sm', {
      // 'd-none': !this.state.filterValue || this.state.filterValue.length === 0
    });

    const filterControl = this.props.showFilter
      ? (
        <div className={filterClasses}>
          <div className='input-group'>
            <button className={clearClasses} style={{ position: 'absolute', right: '45px', top: '3px', zIndex: 10 }} onClick={this.handleClearFilterClick}>
              <i className='far fa-fw fa-times'></i> Clear
          </button>
            <input type='text' className='form-control' placeholder='Type to filter' value={this.state.filterValue} onChange={this.handleFilterChange} onKeyPress={this.handleKeyPress} />
            <div className="input-group-append">
              <button className={filterButtonClasses} onClick={this.handleSearchClick}>
                <i className='far fa-search'></i>
              </button>
            </div>
          </div>
        </div>
      )
      : '';

    return (
      <div className={this.props.containerCssClass}>
        <div className='row'>
          <div className='col-8'>
            {this.props.children}
          </div>
          {filterControl}
        </div>
        {pager}
        {this.props.showSpinner ? (
          this.props.spinner
        ) : (
            <>
              <table className={this.props.tableCssClass}>
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
            </>
          )
        }
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
      this.setState({ currentPage: pageNumber });
    }
  }

  // Update local state
  handleFilterChange(e: SyntheticEvent) {
    e.stopPropagation();
    this.setState({ filterValue: e.target.value });
  }

  // Call external onSearch if pased
  handleSearchClick(e: SyntheticEvent) {
    e.stopPropagation();
    this.props.onSearch && this.props.onSearch(this.state.filterValue);
  }

  handleClearFilterClick(e: SyntheticEvent) {
    e.preventDefault();

    // Reset to first page to re-orient user
    if (this.state.filterValue) {
      this.setState({ filterValue: '' });
      this.handlePageChange(1);
      this.props.onClear && this.props.onClear();
    }
  }

  handleKeyPress(e: MouseEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.handlePageChange(1);
      this.props.onSearch && this.props.onSearch(this.state.filterValue);
    }
  }
}

TabletableContainer.defaultProps = {
  containerCssClass: 'tabletable',
  pagerSize: 10,
  rowsPerPage: 5,
  showPager: true,
  showFilter: false,
  tableCssClass: 'table table-striped table-bordered table-hover',
};