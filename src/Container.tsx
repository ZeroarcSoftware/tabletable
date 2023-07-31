// Tabletable - Copyright 2020 Zeroarc Software, LLC
'use strict';

import React, { useState, ReactElement, SyntheticEvent, FunctionComponent, useEffect, useRef, useCallback, ReactComponentElement, Component, ReactNode } from 'react';
import Immutable from 'immutable';
import ClassNames from 'classnames';
// Fonts
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSort } from '@fortawesome/free-solid-svg-icons/faSort';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch';
import { faSortDown } from '@fortawesome/free-solid-svg-icons/faSortDown';
import { faSortUp } from '@fortawesome/free-solid-svg-icons/faSortUp';
library.add(
  faSort,
  faSortDown,
  faSortUp,
  faTimes,
  faSearch,
);

// Local
import Pager from './Pager';
import { Data, Column, Row, Context, SortDirection, TableMode, SortCriteria, RowError } from './ts_types';

type Props = {
  columns: Array<Column>,
  children: ReactNode, 
  data: Data,
  pagerSize: number,
  rowsPerPage: number,
  // Optional
  addActionWidth?: number,
  createActions?: any,
  createMode?: boolean,
  createError?: RowError,
  containerCssClass?: string,
  currentPage?: number,
  mode?: TableMode,
  // This is used to set the initial state of the filter. If the parent component changes it,
  // the filter will be reset the new value
  filterValue?: string,
  pager?: any, // TODO WTH is the type for this
  onClear?: () => void,
  onSearch?: (searchText: string) => void,
  onSort?: (key: string, direction: SortDirection) => void,
  onPageChange?: (page: number) => void,
  responsive?: boolean,
  rowContext?: (row: Row, number: number) => any,
  rowCssClass?: (row: Row, number: number, Context: Context) => string | string,
  showFilter?: boolean,
  showPager?: boolean,
  showSpinner?: boolean,
  spinner?: any,
  sortCriteria?: SortCriteria,
  tableCssClass?: string,
  totalRows?: number,
}

const TabletableContainer: FunctionComponent<Props> = ({
  addActionWidth = 700, // Default width of add actions
  children, // Note: FunctionComponent allows use of children even though we haven't defined them in our Props
  columns,
  containerCssClass = 'tabletable',
  createActions = null,
  createError = null,
  currentPage = 1,
  data,
  mode = 'display',
  filterValue = '',
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
  tableCssClass = 'table table-striped table-bordered table-hover mb-1',
  totalRows,
}) => {

  const [formFilterValue, setFilterValue] = useState(filterValue);
  const [tableWidth, setTableWidth] = useState(0);
  const [showScroll, setShowScroll] = useState(false);

  let resizeTimeout: null | NodeJS.Timeout = null;
  const responsiveTableRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const scrollLock = useRef(false);
  const scrollLeft = useRef(0);

  const callbackTableRef = useCallback((node: HTMLDivElement) => {
    if (node !== null) {
      responsiveTableRef.current = node;
      if (node.scrollWidth === node.clientWidth) {
        setShowScroll(false);
      }
      else {
        setShowScroll(true);
        setTableWidth(node.scrollWidth);
      }
    }
  }, [mode]);

  // Track filterValue changes and reset the state to the passed in value
  // if it changes.
  useEffect(() => {
    setFilterValue(filterValue);
  }, [filterValue]);

  // Retain scroll location if defined.
  useEffect(() => {
    if (responsive && !showSpinner && scrollLeft?.current > 0 && responsiveTableRef?.current)
      responsiveTableRef.current.scrollLeft = scrollLeft.current;
  }, [showSpinner]);

  useEffect(() => {
    window.addEventListener('resize', delayedResize);
    return () => window.removeEventListener('resize', delayedResize);
  }, []);

  //#region Event Handlers

  const delayedResize = () => {

    if (resizeTimeout) {
      if (responsiveTableRef.current) {
        // Determine if there should be a scrollbar shown.
        if (responsiveTableRef.current.scrollWidth === responsiveTableRef.current.clientWidth) {
          // No scrollbar on table, remove scroll control.
          setShowScroll(false);
        }
        else {
          // Scrollbar is active, recalculate scroll widths.
          setShowScroll(true);
          setTableWidth(responsiveTableRef.current.scrollWidth);
        }
      }
      clearTimeout(resizeTimeout);
    }

    resizeTimeout = setTimeout(() => { }, 200);
  };

  const handlePageChange = (pageNumber: number) => {
    if (onPageChange) {
      onPageChange(pageNumber);
    }
  };

  // Call external onSearch if pased
  const handleSearchClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onSearch && onSearch(formFilterValue);
  };

  // Call external onSort, pass column key pressed.
  const handleSortClick = (col: Column) => {
    if (!col.key || !col.sortable) return;

    // Check to see if the column clicked is the one we initalized
    // If so change direction, if not update sortCriteria with new sort, defualt to 'asc'
    let direction: SortDirection = 'asc';
    if (sortCriteria !== undefined && sortCriteria.key === col.key) {
      // Reversing current sort.
      direction = sortCriteria.direction === 'asc' ? 'desc' : 'asc';
      onSort!(col.key, direction);
    }
    else {
      // Sorting new column
      onSort!(col.key, direction);
    }
  };

  const handleClearFilterClick = (e: SyntheticEvent) => {
    e.preventDefault();
    setFilterValue('');
    onClear && onClear();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch && onSearch(formFilterValue);
    }
  };

  // Keep top scroll controller and master table scrollbar on bottom in sync.
  const handleScrollControlScroll = (e: React.UIEvent<HTMLElement>): void => {
    if (responsive && !scrollLock.current && responsiveTableRef?.current) {
      scrollLock.current = true;
      const left = e.currentTarget.scrollLeft;
      responsiveTableRef.current.scrollLeft = left;

      setTimeout(() => {
        scrollLeft.current = left;
        scrollLock.current = false;
      }, 1);
    }
  };

  const handleTableScroll = (e: React.UIEvent<HTMLElement>): void => {
    if (responsive && !scrollLock.current && scrollerRef?.current) {
      scrollLock.current = true;
      const left = e.currentTarget.scrollLeft;
      scrollerRef.current.scrollLeft = left;

      setTimeout(() => {
        scrollLeft.current = left;
        scrollLock.current = false;
      }, 1);
    }
  };

  //#endregion

  if (!Immutable.isImmutable(data)) {
    console.error('Invalid prop data supplied to TableTable. Expected Immutable iterable.');
    return (<div>INVALID DATA</div>);
  }

  let headerComponents: JSX.Element[] = [];

  const colSize = columns.length;

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
    const context = Immutable.fromJS(rowContext ? rowContext(row, index) : {}) as any;
    const error = rowContext ? rowContext(row, index)?.error : null;

    let _rowCssClass = '';
    if (typeof rowCssClass === 'string') {
      _rowCssClass = rowCssClass;
    }
    else if (typeof rowCssClass === 'function') {
      const renderedClass = rowCssClass(row, index, context && context.toObject());
      if (typeof renderedClass === 'string') {
        _rowCssClass = renderedClass;
      }
      else {
        console.error('rowCssClass function must return a string value. Was ' + typeof renderedClass);
      }
    }

    if (error && !error.key) {
      _rowCssClass += ' bg-danger';
    }

    // Build out components for the row
    let rowComponents: JSX.Element[] = [];
    columns.forEach((col, i) => {
      // If visible is false or undefined, don't show the column
      if (col.visible === false) return;

      // elementCssClass can either be a string or a function that returns a string
      let elementCssClass: any = col.elementCssClass;
      if (typeof col.elementCssClass === 'function') {
        elementCssClass = col.elementCssClass(row, index, context && context.toObject());
        if (typeof elementCssClass !== 'string') console.error('elementCssClass function must return a string value. Was ' + typeof elementCssClass);
      }

      const fieldLevelError = !!(col.key && error?.key?.toLowerCase() === col.key.toLowerCase());

      if (mode === 'edit' && typeof col.edit === 'function') {
        rowComponents.push(
          <td key={`td-${index}-${i}`} className={elementCssClass}>{col.edit(row, index, context && context.toObject(), fieldLevelError)}</td>
        );
      }
      else if (typeof col.data === 'function') {
        rowComponents.push(
          <td key={`td-${index}-${i}`} className={elementCssClass}>{col.data(row, index, context && context.toObject())}</td>
        );
      }
      else {
        rowComponents.push(
          <td key={`td-${index}-${i}`} className={elementCssClass}></td>
        );
      }
    });

    const errorRow = error
      ? (
        <tr key={`td-${index}-error`}>
          <td colSpan={columns.length} className='text-danger' style={{ height: '40px' }}>
            <div style={{ position: 'fixed' }} >
              <FontAwesomeIcon icon={['far', 'exclamation-triangle']} fixedWidth /> Error: {error.errorMessage}
            </div>
          </td>
        </tr>
      )
      : null;

    return (
      <React.Fragment key={`tr-${index}`}>
        <tr className={_rowCssClass}>
          {rowComponents}
        </tr>
        {errorRow}
      </React.Fragment>
    );
  });

  let createRow: JSX.Element | null = null;
  let errorMsg: JSX.Element | null = null;

  if (mode === 'create') {
    let _rowCssClass = '';
    if (typeof rowCssClass === 'string') {
      _rowCssClass = rowCssClass;
    }

    // Build out components for the row
    let rowComponents: JSX.Element[] = [];
    columns.forEach((col, i) => {
      // If visible is false or undefined, don't show the column
      if (col.visible === false) return;

      // elementCssClass can either be a string or a function that returns a string
      let elementCssClass: any = col.elementCssClass;

      const fieldLevelError = !!(col.key && createError?.key?.toLowerCase() === col.key.toLowerCase());

      if (mode === 'create' && typeof col.create === 'function') {
        rowComponents.push(
          <td key={`td-create-${i}`} className={elementCssClass}>{col.create(fieldLevelError)}</td>
        );
      }
      else {
        rowComponents.push(
          <td key={`td-create-${i}`} className={elementCssClass}></td>
        );
      }
    });

    var addActionStyles = {
      float: 'right',
      position: 'sticky',
      right: 0,
      width: addActionWidth,
      textAlign: 'right',
    } as React.CSSProperties;

    let createActionRow = null;

    if (createError?.errorMessage) {
      errorMsg = (
        <div className='text-danger add_error' style={{position: 'fixed'}}>
          <FontAwesomeIcon icon={['far', 'exclamation-triangle']} fixedWidth /> Error: {createError.errorMessage}
        </div>
      );
    }

    if (createActions) {
      createActionRow = (
        <tr className={_rowCssClass}>
          <td colSpan={colSize}>
            <>
              <div style={addActionStyles}>
                {createActions}
              </div>
              {errorMsg}
            </>
          </td>
        </tr>
      );
    }
    // Create error row when no inline actions are defined.
    else if (createError?.errorMessage) {
      createActionRow = (
        <tr className={_rowCssClass}>
          <td className='text-danger' colSpan={columns.length}>
            <div style={{position: 'fixed'}}>
              <FontAwesomeIcon icon={['far', 'exclamation-triangle']} fixedWidth /> Error: {createError.errorMessage}
            </div>
          </td>
        </tr>
      );
    }

    createRow = (
      <>
        <tr className={_rowCssClass}>
          {rowComponents}
        </tr>
        {createActionRow}
      </>
    );

  }


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
          <button className={clearClasses} style={{ position: 'absolute', right: '47px', top: '3px', borderRadius: '0.2rem', zIndex: 10 }} onClick={handleClearFilterClick}>
            <FontAwesomeIcon icon={['fas', 'times']} fixedWidth /> Clear
          </button>
          <input type='text' className='form-control' placeholder='Type to filter' value={formFilterValue} onChange={e => setFilterValue(e.target.value)} onKeyPress={handleKeyPress} />
          <button className={filterButtonClasses} onClick={handleSearchClick}>
            <FontAwesomeIcon icon={['fas', 'search']} fixedWidth />
          </button>
        </div>
      </div>
    )
    : '';

  const scrollControl = (
    <div className="scroll-control mb-2" onScroll={handleScrollControlScroll} ref={scrollerRef}>
      <div id="scroller" style={{ width: tableWidth }}></div>
    </div>
  );

  return (
    <div className={containerCssClass}>
      <div className='row'>
        <div className='col-8'>
          {children}
        </div>
        {filterControl}
      </div>
      <div className='mb-2'>
        {pager}
      </div>
      {showSpinner ? (
        spinner
      ) : (<>
        <div className="scroll-container">
          {responsive && showScroll ? scrollControl : null}
        </div>
        <div className={responsive ? 'table-responsive' : ''} ref={callbackTableRef} onScroll={handleTableScroll}>
          <table className={tableCssClass}>
            <thead>
              <tr>
                {headerComponents}
              </tr>
            </thead>
            <tbody>
              {mode === 'create' && createRow}
              {rows.toList()}
            </tbody>
          </table>
        </div>
      </>
      )}
      <div className='mt-2'>
        {pager}
      </div>
    </div>
  );
}

export default TabletableContainer;