// Tabletable - Copyright 2020 Zeroarc Software, LLC
'use strict';

import React, { useState, ReactElement, SyntheticEvent, MouseEvent, FunctionComponent } from 'react';
import Immutable from 'immutable';
import ClassNames from 'classnames';
// Fonts
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faSort, faTimes, faSearch, faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons'
library.add(
  faSort,
  faSortDown,
  faSortUp,
  faTimes,
  faSearch,
);

// Local
import Pager from './Pager';
import { Data, Column, Row, Context } from './ts_types';

type Props = {
  columns: Array<Column>,
  data: Data,
  pagerSize: number,
  rowsPerPage: number,

  // Optional
  containerCssClass?: string,
  currentPage?: number,
  editable?: boolean,
  pager?: any, // TODO WTH is the type for this
  onClear?: () => void,
  onSearch?: (searchText: string) => void,
  onSort?: (key: string, direction: string) => void,
  onPageChange?: (page: number) => void,
  responsive?: boolean,
  rowContext?: (row: Row, number: number) => any,
  rowCssClass?: (row: Row, number: number, Context: Context) => string | string,
  showFilter?: boolean,
  showPager?: boolean,
  showSpinner?: boolean,
  spinner?: any,
  sortCriteria?: { key: string, direction: string },
  tableCssClass?: string,
  totalRows?: number,
}

const TabletableContainer: FunctionComponent<Props> = ({
  children, // Note: FunctionComponent allows use of children even though we haven't defined them in our Props
  columns,
  containerCssClass = 'tabletable',
  currentPage = 1,
  data,
  editable = false,
  onClear,
  onPageChange,
  onSearch,
  onSort,
  pagerSize = 10,
  rowContext,
  rowCssClass = '',
  rowsPerPage = 5,
  showPager = true,
  showFilter = false,
  showSpinner,
  spinner,
  sortCriteria,
  responsive = false,
  tableCssClass = 'table table-striped table-bordered table-hover',
  totalRows,
}) => {

  const [formFilterValue, setFilterValue] = useState("");

  //#region Event Handlers

  const handlePageChange = (pageNumber: number) => {
    if (onPageChange) {
      onPageChange(pageNumber);
    }
  }

  // Call external onSearch if pased
  const handleSearchClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onSearch && onSearch(formFilterValue);
  }

  // Call external onSort, pass column key pressed.
  const handleSortClick = (col: Column) => {
    if (!col.key || !col.sortable) return;

    // Check to see if the column clicked is the one we initalized
    // If so change direction, if not update sortCriteria with new sort, defualt to 'asc'
    let direction = 'asc';
    if (sortCriteria !== undefined && sortCriteria.key === col.key) {
      // Reversing current sort.
      direction = sortCriteria.direction === 'asc' ? 'desc' : 'asc';
      onSort!(col.key, direction);
    }
    else {
      // Sorting new column
      onSort!(col.key, direction);
    }
  }

  const handleClearFilterClick = (e: SyntheticEvent) => {
    e.preventDefault();
    // Reset to first page to re-orient user
    if (formFilterValue) {
      setFilterValue('');
      handlePageChange(1);
      onClear && onClear();
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handlePageChange(1);
      onSearch && onSearch(formFilterValue);
    }
  }

  //#endregion

  if (!Immutable.isImmutable(data)) {
    console.error('Invalid prop data supplied to TableTable. Expected Immutable iterable.');
    return (<div>INVALID DATA</div>);
  }

  let headerComponents: JSX.Element[] = [];

  columns.forEach((col, i) => {
    // If visible is false, hide the column. If visible is not defined, default to showing column.
    if (typeof col.visible === 'undefined' || col.visible) {
      let sortIcon: JSX.Element | null = null;
      // Add icon/action if column is sortable.
      if (col.sortable) {
        if (sortCriteria !== undefined && sortCriteria.key === col.key) {
          if (sortCriteria.direction === 'asc') {
            sortIcon = <FontAwesomeIcon icon={['fas', 'sort-up']} fixedWidth />;
          }
          else {
            sortIcon = <FontAwesomeIcon icon={['fas', 'sort-down']} fixedWidth />;
          }
        }
        else {
          sortIcon = <FontAwesomeIcon icon={['fas', 'sort']} fixedWidth />;
        }
      }
      headerComponents.push(
        <th key={`th-${i}`} onClick={() => handleSortClick(col)} data-column={col.key} className={col.headerCssClass}>{col.display || ''}{sortIcon}</th>
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
      // If visible is false or undefined, don't show the column
      if (col.visible == false) return;

      // elementCssClass can either be a string or a function that returns a string
      let elementCssClass: any = col.elementCssClass;
      if (typeof col.elementCssClass === 'function') {
        elementCssClass = col.elementCssClass(row, index, context && context.toObject());
        if (typeof elementCssClass !== 'string') console.error('elementCssClass function must return a string value. Was ' + typeof elementCssClass);
      }

      if (editable && col.edit) {
        rowComponents.push(
          <td key={`${index}-${i}`} className={elementCssClass}>{col.edit(row, index, context && context.toObject())}</td>
        );
      }
      else {
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
  });

  const filterControl = showFilter
    ? (
      <div className={filterClasses}>
        <div className='input-group'>
          <button className={clearClasses} style={{ position: 'absolute', right: '45px', top: '3px', zIndex: 10 }} onClick={handleClearFilterClick}>
            <FontAwesomeIcon icon={['fas', 'times']} fixedWidth /> Clear
          </button>
          <input type='text' className='form-control' placeholder='Type to filter' value={formFilterValue} onChange={e => setFilterValue(e.target.value)} onKeyPress={handleKeyPress} />
          <div className="input-group-append">
            <button className={filterButtonClasses} onClick={handleSearchClick}>
              <FontAwesomeIcon icon={['fas', 'search']} fixedWidth />
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
          <div className={responsive ? 'table-responsive' : ''}>
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
          </div>
        )
      }
    </div>
  );
}

export default TabletableContainer;