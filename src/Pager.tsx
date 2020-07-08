// Tabletable - Copyright 2018 Zeroarc Software, LLC
'use strict';

import ClassNames from 'classnames';
import React, { SyntheticEvent, FunctionComponent } from 'react';

type Props = {
  displayPages: number,
  maxPage: number,
  currentPage: number,
  onPageChange: (page: number) => void
};

const TabletablePager: FunctionComponent<Props> = ({
  displayPages,
  maxPage = 1,
  currentPage = 1,
  onPageChange }) => {

  const pageChange = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const el = e.target as HTMLInputElement;
    const page = parseInt(el.getAttribute('data-value') || '');
    if (!isNaN(page))
      onPageChange(page);
  }

  const previousPageChange = (e: SyntheticEvent) => {
    e.preventDefault();
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  }

  const nextPageChange = (e: SyntheticEvent) => {
    e.preventDefault();
    if (currentPage < maxPage) {
      onPageChange(currentPage + 1);
    }
  }

  const firstPageChange = (e: SyntheticEvent) => {
    e.preventDefault();
    onPageChange(1);
  }

  const lastPageChange = (e: SyntheticEvent) => {
    e.preventDefault();
    onPageChange(maxPage);
  }

  let options = [];

  let startIndex = Math.max(currentPage - Math.floor(displayPages / 2), 1);
  const endIndex = Math.min(startIndex + (displayPages - 1), maxPage);

  if (maxPage >= displayPages && (endIndex - startIndex) <= displayPages) {
    startIndex = endIndex - (displayPages - 1);
  }

  for (let i = startIndex; i <= endIndex; i++) {
    const thisButtonClasses = ClassNames('btn btn-sm', {
      'btn-primary': currentPage === i,
      'btn-outline-secondary': currentPage !== i,
      'mr-1': i !== endIndex
    });
    options.push(
      <button key={i}
        className={thisButtonClasses}
        style={{ minWidth: '2.5em' }}
        data-value={i}
        onClick={pageChange}>{i}</button>
    );
  }

  return (
    <div className='row btn-toolbar my-3' role='toolbar'>
      <div className='col-3' role='group'>
        <button className='btn btn-outline-secondary btn-sm' onClick={firstPageChange}><i className='far fa-step-backward'></i> First</button>
      </div>
      <div className='col-6 text-center' role='group'>
        <button className='btn btn-outline-secondary btn-sm' onClick={previousPageChange}><i className='far fa-chevron-left'></i> Prev</button>
        <div className='mx-2' style={{ display: 'inline-block' }}>
          {options}
        </div>
        <button className='btn btn-outline-secondary btn-sm' onClick={nextPageChange}><i className='far fa-chevron-right'></i> Next</button>
      </div>

      <div className='col-3 text-right' role='group'>
        <button className='btn btn-outline-secondary btn-sm' onClick={lastPageChange}><i className='far fa-step-forward'></i> Last</button>
      </div>
    </div>
  );
};

export default TabletablePager;
