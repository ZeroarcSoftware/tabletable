// Tabletable - Copyright 2018 Zeroarc Software, LLC
'use strict';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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

  const pageChange = (e: SyntheticEvent) => {
    e.preventDefault();
    
    const el = e.currentTarget.parentElement;
    if (el) {
      const page = parseInt(el.getAttribute('data-value') || '');

      if (!isNaN(page))
        onPageChange(page);
    }
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
    const thisButtonClasses = ClassNames('page-item', {
      'active': currentPage === i,
    });
    options.push(
      <li key={`option-${i}`}
        className={thisButtonClasses}
        aria-current={currentPage === i ? 'page' : false}
        data-value={i}>
          <a href='#' onClick={pageChange} className='page-link'>{i}</a>
      </li>
    );
  }

  const backButtonClasses = ClassNames('page-item', {
    'disabled': currentPage === 1,
  });

  const forwardButtonClasses = ClassNames('page-item', {
    'disabled': currentPage === maxPage,
  });
 

  return (
    <nav aria-label='Table navigation'> 
      <ul className='pagination pagination-sm justify-content-center mb-0'>
        <li className={backButtonClasses}>
          <a href='#' onClick={firstPageChange} className='page-link' aria-label='First'>
            <FontAwesomeIcon icon={['far', 'step-backward']} fixedWidth aria-hidden='true' /> 
          </a>
        </li>
        <li className={backButtonClasses}>
          <a href='#' onClick={previousPageChange} className='page-link' aria-label='Previous'>
            <FontAwesomeIcon icon={['far', 'chevron-left']} fixedWidth aria-hidden='true' /> 
          </a>
        </li>

        {options}

        <li className={forwardButtonClasses}>
          <a href='#' onClick={nextPageChange} className='page-link' aria-label='Next'>
            <FontAwesomeIcon icon={['far', 'chevron-right']} fixedWidth aria-hidden='true' /> 
          </a>
        </li>
        <li className={forwardButtonClasses}>
          <a href='#' onClick={lastPageChange} className='page-link' aria-label='Last'>
            <FontAwesomeIcon icon={['far', 'step-forward']} fixedWidth aria-hidden='true' /> 
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default TabletablePager;
