/* Copyright 2015 Zeroarc Software, LLC
*
*  Pager control
*/

// External
let React = require('react');
let ReactShallowCompare = require('react-addons-shallow-compare');
let ClassNames = require('classnames');
let Autobind = require('autobind-decorator');

@Autobind
export default class TabletablePager extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    return ReactShallowCompare(this, nextProps, nextState);
  }

  render() {
    let options = [];

    let startIndex = Math.max(this.props.currentPage - Math.floor(this.props.displayPages / 2), 1);
    let endIndex = Math.min(startIndex + (this.props.displayPages - 1), this.props.maxPage);

    if (this.props.maxPage >= this.props.displayPages && (endIndex - startIndex) <= this.props.displayPages) {
      startIndex = endIndex - (this.props.displayPages - 1);
    }

    for(let i = startIndex; i <= endIndex; i++){
      let thisButtonClasses = ClassNames('btn', 'btn-white', 'btn-sm', {
        'label-success': this.props.currentPage === i
      });
      options.push(<button key={i} className={thisButtonClasses} data-value={i} onClick={this.pageChange}>{i}</button>);
    }

    return (
      <div className='btn-toolbar text-center' role='toolbar' style={{marginTop: '20px', marginBottom: '20px'}} >
        <div className='btn-group pull-left' role='group'>
          <button className='btn btn-white btn-sm' onClick={this.firstPageChange}><i className='fa fa-step-backward'></i> First</button>
        </div>
        <div className='btn-group pull-right' role='group'>
          <button className='btn btn-white primary btn-sm' onClick={this.lastPageChange}><i className='fa fa-step-forward'></i> Last</button>
        </div>
        <div className='btn-group' role='group' style={{float:'none'}}>
          <button className='btn btn-white primary btn-sm' onClick={this.previousPageChange}><i className='fa fa-chevron-left'></i> Prev</button>
        </div>
        <div className='btn-group' role='group' style={{float:'none'}}>
          {options}
        </div>
        <div className='btn-group' role='group' style={{float:'none'}}>
          <button className='btn btn-white primary btn-sm' onClick={this.nextPageChange}><i className='fa fa-chevron-right'></i> Next</button>
        </div>
      </div>
    )
  }

  //
  // Custom methods
  //

  pageChange(e) {
    e.stopPropagation();
    this.props.onPageChange(parseInt(e.target.getAttribute('data-value')));
  }

  previousPageChange(e) {
    e.stopPropagation();
    if (this.props.currentPage > 1) {
      this.props.onPageChange(this.props.currentPage - 1);
    }
  }

  nextPageChange(e) {
    e.stopPropagation();
    if (this.props.currentPage < this.props.maxPage) {
      this.props.onPageChange(this.props.currentPage + 1);
    }
  }

  firstPageChange(e) {
    e.stopPropagation();
    this.props.onPageChange(1);
  }

  lastPageChange(e) {
    e.stopPropagation();
    this.props.onPageChange(this.props.maxPage);
  }
}

TabletablePager.defaultProps = {
  maxPage: 1,
  currentPage: 1,
};

TabletablePager.propTypes = {
  displayPages: React.PropTypes.number.isRequired,
  maxPage: React.PropTypes.number.isRequired,
  currentPage: React.PropTypes.number.isRequired,
  onPageChange: React.PropTypes.func.isRequired,
};
