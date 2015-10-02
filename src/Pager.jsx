/* Copyright 2015 Zeroarc Software, LLC
*
*  Pager control
*/

// External
let React = require('react/addons');
let PureRenderMixin = React.addons.PureRenderMixin;
let ClassNames = require('classnames');


let TabletablePager = React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    displayPages: React.PropTypes.number.isRequired,
    maxPage: React.PropTypes.number.isRequired,
    currentPage: React.PropTypes.number.isRequired,
    onPageChange: React.PropTypes.func.isRequired,
  },

  getDefaultProps() {
    return {
      maxPage: 1,
      currentPage: 1,
    }
  },

  render() {
    let options = [];

    let startIndex = Math.max(this.props.currentPage - 5, 1);
    let endIndex = Math.min(startIndex + 9, this.props.maxPage);

    if (this.props.maxPage >= 10 && (endIndex - startIndex) <= 10) {
      startIndex = endIndex - 9;
    }

    for(let i = startIndex; i <= endIndex ; i++){
      let thisButtonClasses = ClassNames('btn', 'btn-white', 'btn-sm', {
        'label-success': this.props.currentPage === i
      });
      options.push(<button key={i} className={thisButtonClasses} data-value={i} onClick={this.pageChange}>{i}</button>);
    }

    return (
      <div className='btn-toolbar text-center col-xs-12' role='toolbar'>
        <div className='btn-group pull-left' role='group'>
          <button className='btn btn-white btn-sm' onClick={this.firstPageChange}><i className='fa fa-step-backward'></i> First</button>
        </div>
        <div className='btn-group pull-right' role='group'>
          <button className='btn btn-white btn-sm' onClick={this.lastPageChange}><i className='fa fa-step-forward'></i> Last</button>
        </div>
        <div className='btn-group' role='group'>
          <button className='btn btn-white btn-sm' onClick={this.previousPageChange}><i className='fa fa-chevron-left'></i> Prev</button>
        </div>
        <div className='btn-group' role='group'>
          {options}
        </div>
        <div className='btn-group' role='group'>
          <button className='btn btn-white btn-sm' onClick={this.nextPageChange}><i className='fa fa-chevron-right'></i> Next</button>
        </div>
      </div>
    )
  },

  pageChange(e) {
    e.stopPropagation();
    this.props.onPageChange(parseInt(e.target.getAttribute('data-value')));
  },

  previousPageChange(e) {
    e.stopPropagation();
    if (this.props.currentPage > 1) {
      this.props.onPageChange(this.props.currentPage - 1);
    }
  },

  nextPageChange(e) {
    e.stopPropagation();
    if (this.props.currentPage < this.props.maxPage) {
      this.props.onPageChange(this.props.currentPage + 1);
    }
  },

  firstPageChange(e) {
    e.stopPropagation();
    this.props.onPageChange(1);
  },

  lastPageChange(e) {
    e.stopPropagation();
    this.props.onPageChange(this.props.maxPage);
  },
});

module.exports = TabletablePager;
