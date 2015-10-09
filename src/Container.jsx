/* tabletable - Copyright 2015 Zeroarc Software, LLC
 *
 * Top level container component
 */

'use strict';

// External
let React = require('react');
let ReactShallowCompare = require('react-addons-shallow-compare');
let Immutable = require('immutable');
let ClassNames = require('classnames');
let Autobind = require('autobind-decorator');

// Local
let Pager = require('./Pager');


@Autobind
export default class TabletableContainer extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      currentPage: 1,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return ReactShallowCompare(this, nextProps, nextState);
  }

  render() {
    let headerComponents = [];

    Object.keys(this.props.columns).forEach(k => {
        // If visible is false, hide the column. If visible is not defined, default to showing column
      if (typeof this.props.columns[k].visible === 'undefined' || this.props.columns[k].visible) {
        headerComponents.push(
          <th key={`th-${k}`} className={this.props.columns[k].cssClass}>{this.props.columns[k].display || k}</th>
        );
      }
    });

    let skipRows = this.props.rowsPerPage * (this.state.currentPage - 1);
    let takeRows = Math.min(this.props.rowsPerPage, this.props.data.count() - skipRows);

    let rows = this.props.data.skip(skipRows).take(takeRows).map((row,index) => {
      let rowComponents = [];

      Object.keys(this.props.columns).forEach(k => {
        // If visible is false, hide the column. If visible is not defined, default to showing column
        if (typeof this.props.columns[k].visible === 'undefined' || this.props.columns[k].visible) {
          rowComponents.push(
            <td key={`${index}-${k}`} className={this.props.columns[k].cssClass}>{this.props.columns[k].data(row,index)}</td>
          );
        }
      });

      return (
        <tr key={index}>
          {rowComponents}
        </tr>
      );
    });

    // Setup pager
    let totalPages = Math.ceil(this.props.data.count() / this.props.rowsPerPage);

    let pager = '';

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
    let filterClasses = ClassNames({
      hidden: !this.props.onFilterAction || !this.props.showFilter
    });

    let clearClasses = ClassNames('btn', 'btn-white', 'btn-xs', {
      hidden: this.props.filterValue.length === 0
    });

    return (
      <div className='tabletable'>
          <div className={filterClasses}>
            <div className='input-group col-xs-4 col-xs-offset-8 room-bottom'>
              <button className={clearClasses} style={{position: 'absolute', right: '6px', top: '6px', zIndex: 3}} onClick={this.handleClearFilterClick}><i className='fa fa-times'></i> Clear</button>
              <input type='text' className='form-control' placeholder='Filter outputs' value={this.props.filterValue} onChange={this.handleFilterChange} />
            </div>
          </div>
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
  }

  //
  // Custom methods
  //

  handlePageChange(pageNumber) {
    this.setState({currentPage: pageNumber});
  }

  // Update local state and call external onFilterAction if defined
  handleFilterChange(e) {
    e.stopPropagation();
    this.props.onFilterAction && this.props.onFilterAction(e.target.value);
  }

  handleClearFilterClick(e) {
    e.stopPropagation();
    this.props.onFilterAction && this.props.onFilterAction('');
  }
}

TabletableContainer.defaultProps = {
  rowsPerPage: 5,
  pagerSize: 10,
  showPager: true,
  showFilter: true,
};

TabletableContainer.propTypes = {
  data: React.PropTypes.instanceOf(Immutable.Seq).isRequired,
  columns: React.PropTypes.object.isRequired,
  rowsPerPage: React.PropTypes.number.isRequired,
  pagerSize: React.PropTypes.number.isRequired,
  showPager: React.PropTypes.bool.isRequired,
  showFilter: React.PropTypes.bool.isRequired,
  // Optional
  pager: React.PropTypes.func,
  onFilterAction: React.PropTypes.func,
  filterValue: React.PropTypes.string,
};
