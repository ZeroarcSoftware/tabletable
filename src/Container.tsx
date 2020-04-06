// Tabletable - Copyright 2020 Zeroarc Software, LLC
'use strict';

import React, { ReactElement, SyntheticEvent, MouseEvent, FunctionComponent } from 'react';
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
  filterValue?: string | undefined,
  pager?: any, // TODO WTH is the type for this
  onClear?: () => void,
  onSearch?: (searchText: string) => void,
  onPageChange?: (page: number) => void,
  rowContext?: (Row: Row, number: number) => any,
  rowCssClass?: (Row: Row, number: number, Context: Context) => string | string,
  showSpinner?: boolean,
  spinner?: any,
  totalRows?: number,
}

const TabletableContainer: FunctionComponent<Props> = ({
  children, // Note: FunctionComponent allows use of children even though we haven't defined them in our Props
  columns,
  containerCssClass = 'tabletable',
  currentPage = 1,
  data,
  filterValue = '',
  onClear,
  onPageChange,
  onSearch,
  pagerSize = 10,
  rowContext,
  rowCssClass = '',
  rowsPerPage = 5,
  showPager = true,
  showFilter = false,
  showSpinner,
  spinner,
  tableCssClass = 'table table-striped table-bordered table-hover',
  totalRows,
}) => {

  //
  // Custom methods
  //
  const handlePageChange = (pageNumber: number) => {
    if (onPageChange) {
      onPageChange(pageNumber);
    }
    else {
      // this.setState({ currentPage: pageNumber });
    }
  }

  // Update local state
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    // this.setState({ filterValue: e.target.value });
  }

  // Call external onSearch if pased
  const handleSearchClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onSearch // && onSearch(this.state.filterValue);
  }

  const handleClearFilterClick = (e: SyntheticEvent) => {
    e.preventDefault();

    // Reset to first page to re-orient user
    if (filterValue) {
      // this.setState({ filterValue: '' });
      handlePageChange(1);
      onClear && onClear();
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handlePageChange(1);
      onSearch // && onSearch(this.state.filterValue);
    }
  }

  if (!Immutable.isImmutable(data)) {
    console.error('Invalid prop data supplied to TableTable. Expected Immutable iterable.');
    return (<div>INVALID DATA</div>);
  }

  let headerComponents: JSX.Element[] = [];

  columns.forEach((col, i) => {
    // If visible is false, hide the column. If visible is not defined, default to showing column
    if (typeof col.visible === 'undefined' || col.visible) {
      headerComponents.push(
        <th key={`th-${i}`} className={col.headerCssClass}>{col.display || ''}</th>
      );
    }
  });

  // If totalRows prop has been passed, then we are not using built in paging. Do not skip any rows.
  let skipRows = 0;
  if (!totalRows)
    skipRows = rowsPerPage * (currentPage - 1);

  const takeRows: number = Math.min(rowsPerPage, data.size - skipRows);

  const rows = data.skip(skipRows).take(takeRows).map((row, index) => {
    // Create row context if required. Make it an immutable so nobody tries to abuse it by shoving stuff into it
    // during a column step. We will re-project from the Immutable each time it is used
    const context = Immutable.fromJS(rowContext ? rowContext(row, index) : {});

    if (typeof rowCssClass === 'function') {
      rowCssClass = rowCssClass(row, index, context && context.toObject());
      if (typeof rowCssClass !== 'string') console.error('rowCssClass function must return a string value. Was ' + typeof rowCssClass);
    }

    // Build out components for the row
    let rowComponents: JSX.Element[] = [];
    columns.forEach((col, i) => {
      // If visible is false, hide the column. If visible is not defined, default to showing column
      if (typeof col.visible === 'undefined' || col.visible) {
        // elementCssClass can either be a string or a function that returns a string
        let elementCssClass: any = col.elementCssClass;
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
  totalRows = totalRows ? totalRows : data.size;

  const totalPages: number = Math.ceil(totalRows / rowsPerPage);

  let pager: null | ReactElement<{ currentPage: number, displayPages: number, maxPage: number, onPageChange: (pageNumber: number) => void }> = null;

  if (showPager) {
    // Check for custom pager and use it
    if (pager) {
      pager = React.createElement(pager, {
        onPageChange: handlePageChange,
        displayPages: pagerSize,
        maxPage: totalPages,
        currentPage: currentPage,
      });
    }
    else {
      // Use default pager
      pager =
        <Pager
          onPageChange={handlePageChange}
          displayPages={pagerSize}
          maxPage={totalPages}
          currentPage={currentPage} />
    }
  }

  // Hide filter unless we have a search handler and showFilter is true
  const filterClasses = ClassNames('col-4 justify-content-end', {
    'd-none': !showFilter
  });

  const filterButtonClasses = ClassNames('btn btn-outline-secondary', {
    'd-none': !showFilter || !onSearch,
  });

  const clearClasses: string = ClassNames('btn', 'btn-outline-secondary', 'btn-sm', {
    // 'd-none': !this.state.filterValue || this.state.filterValue.length === 0
  });

  const filterControl = showFilter
    ? (
      <div className={filterClasses}>
        <div className='input-group'>
          <button className={clearClasses} style={{ position: 'absolute', right: '45px', top: '3px', zIndex: 10 }} onClick={handleClearFilterClick}>
            <i className='far fa-fw fa-times'></i> Clear
          </button>
          <input type='text' className='form-control' placeholder='Type to filter' value={filterValue} onChange={handleFilterChange} onKeyPress={handleKeyPress} />
          <div className="input-group-append">
            <button className={filterButtonClasses} onClick={handleSearchClick}>
              <i className='far fa-search'></i>
            </button>
          </div>
        </div>
      </div>
    )
    : '';

  return (
    <div className={containerCssClass}>
      <div className='row'>
        <div className='col-8'>
          {children}
        </div>
        {filterControl}
      </div>
      {pager}
      {showSpinner ? (
        spinner
      ) : (
          <>
            <table className={tableCssClass}>
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
}

export default TabletableContainer;
