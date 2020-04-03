// Tabletable - Copyright 2018 Zeroarc Software, LLC
'use strict';

import Autobind from 'autobind-decorator';
import ClassNames from 'classnames';
import React, { SyntheticEvent } from 'react';

type Props = {
  displayPages: number,
  maxPage: number,
  currentPage: number,
  onPageChange: (page: number) => void
};

@Autobind
export default class TabletablePager extends React.Component<Props> {
  static defaultProps: {
    maxPage: number,
    currentPage: number,
  }

  render() {
    let options = [];

    let startIndex = Math.max(this.props.currentPage - Math.floor(this.props.displayPages / 2), 1);
    const endIndex = Math.min(startIndex + (this.props.displayPages - 1), this.props.maxPage);

    if (this.props.maxPage >= this.props.displayPages && (endIndex - startIndex) <= this.props.displayPages) {
      startIndex = endIndex - (this.props.displayPages - 1);
    }

    for (let i = startIndex; i <= endIndex; i++) {
      const thisButtonClasses = ClassNames('btn', 'btn-white', 'btn-sm', {
        'label-success': this.props.currentPage === i
      });
      options.push(
        <button key={i}
          className={thisButtonClasses}
          style={{ minWidth: '2.5em' }}
          data-value={i}
          onClick={this.pageChange}>{i}</button>
      );
    }

    return (
      <div className='btn-toolbar text-center' role='toolbar' style={{ marginTop: '20px', marginBottom: '20px' }} >
        <div className='btn-group pull-left' role='group'>
          <button className='btn btn-white btn-sm' onClick={this.firstPageChange}><i className='fa fa-step-backward'></i> First</button>
        </div>
        <div className='col-6 text-center' role='group'>
          <button className='btn btn-outline-secondary btn-sm' onClick={this.previousPageChange}><i className='far fa-chevron-left'></i> Prev</button>
          <div className='mx-2' style={{ display: 'inline-block' }}>
            {options}
          </div>
          <button className='btn btn-outline-secondary btn-sm' onClick={this.nextPageChange}><i className='far fa-chevron-right'></i> Next</button>
        </div>
        <div className='btn-group' role='group' style={{ float: 'none' }}>
          <button className='btn btn-white primary btn-sm' onClick={this.previousPageChange}><i className='fa fa-chevron-left'></i> Prev</button>
        </div>
        <div className='btn-group' role='group' style={{ float: 'none' }}>
          {options}
        </div>
        <div className='btn-group' role='group' style={{ float: 'none' }}>
          <button className='btn btn-white primary btn-sm' onClick={this.nextPageChange}><i className='fa fa-chevron-right'></i> Next</button>
        </div>
      </div>
    )
  }

  //
  // Custom methods
  //

  pageChange(e: SyntheticEvent) {
    e.preventDefault();
    this.props.onPageChange(parseInt(e.target.getAttribute('data-value')));
  }

  previousPageChange(e: SyntheticEvent) {
    e.preventDefault();
    if (this.props.currentPage > 1) {
      this.props.onPageChange(this.props.currentPage - 1);
    }
  }

  nextPageChange(e: SyntheticEvent) {
    e.preventDefault();
    if (this.props.currentPage < this.props.maxPage) {
      this.props.onPageChange(this.props.currentPage + 1);
    }
  }

  firstPageChange(e: SyntheticEvent) {
    e.preventDefault();
    this.props.onPageChange(1);
  }

  lastPageChange(e: SyntheticEvent) {
    e.preventDefault();
    this.props.onPageChange(this.props.maxPage);
  }
}

TabletablePager.defaultProps = {
  maxPage: 1,
  currentPage: 1,
};