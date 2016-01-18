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
          <th key={`th-${k}`} className={this.props.columns[k].headerCssClass}>{this.props.columns[k].display || k}</th>
        );
      }
    });

    let skipRows = this.props.rowsPerPage * (this.state.currentPage - 1);
    let takeRows = Math.min(this.props.rowsPerPage, this.props.data.count() - skipRows);

    let rows = this.props.data.skip(skipRows).take(takeRows).map((row,index) => {
      // Create row context if required. Make it an immutable so nobody tries to abuse it by shoving stuff into it
      // during a column step. We will re-project from the Immutable each time it is used
      const context = Immutable.fromJS(this.props.rowContext ? this.props.rowContext(row,index) : {});

      // Assign any row classes
      let rowCssClass = '';
      if (typeof this.props.rowCssClass === 'function') {
        rowCssClass = this.props.rowCssClass(row,index,context.toObject());
        if (typeof rowCssClass !== 'string') console.error('rowCssClass function must return a string value. Was ' + typeof rowCssClass);
      }
      else {
        rowCssClass = this.props.rowCssClass;
      }

      // Build out components for the row
      let rowComponents = [];
      Object.keys(this.props.columns).forEach(k => {
        // If visible is false, hide the column. If visible is not defined, default to showing column
        if (typeof this.props.columns[k].visible === 'undefined' || this.props.columns[k].visible) {
          // elementCssClass can either be a string or a function that returns a string
          let elementCssClass = '';
          if (typeof this.props.columns[k].elementCssClass === 'function') {
            elementCssClass = this.props.columns[k].elementCssClass(row,index,context.toObject());
            if (typeof elementCssClass !== 'string') console.error('elementCssClass function must return a string value. Was ' + typeof elementCssClass);
          }
          else {
            elementCssClass = this.props.columns[k].elementCssClass;
          }

          rowComponents.push(
            <td key={`${index}-${k}`} className={elementCssClass}>{this.props.columns[k].data(row,index,context.toObject())}</td>
          );
        }
      });

      return (
        <tr key={index} className={rowCssClass}>
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
      hidden: !this.props.filterValue || this.props.filterValue.length === 0
    });

    let filterControl = this.props.showFilter
      ? <div className={filterClasses}>
        <div className='input-group col-xs-4 col-xs-offset-8'>
          <button className={clearClasses} style={{position: 'absolute', right: '6px', top: '6px', zIndex: 3}} onClick={this.handleClearFilterClick}><i className='fa fa-times'></i> Clear</button>
          <input type='text' className='form-control' placeholder='Type to filter' value={this.props.filterValue} onChange={this.handleFilterChange} />
        </div>
      </div>
      : '';

      return (
        <div className='tabletable'>
          {filterControl}
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
    // Reset to first page in case we end up with less pages than current page number
    this.setState({currentPage: 1});
    this.props.onFilterAction && this.props.onFilterAction(e.target.value);
  }

  handleClearFilterClick(e) {
    e.stopPropagation();
    // Reset to first page to re-orient user
    this.setState({currentPage: 1});
    this.props.onFilterAction && this.props.onFilterAction('');
  }
}

TabletableContainer.defaultProps = {
  rowsPerPage: 5,
  pagerSize: 10,
  showPager: true,
  showFilter: false,
};

TabletableContainer.propTypes = {
  data: React.PropTypes.instanceOf(Immutable.Seq).isRequired,
  columns: React.PropTypes.object.isRequired,
  rowsPerPage: React.PropTypes.number.isRequired,
  pagerSize: React.PropTypes.number.isRequired,
  showPager: React.PropTypes.bool.isRequired,
  showFilter: React.PropTypes.bool.isRequired,
  // Optional
  rowContext: React.PropTypes.func,
  rowCssClass: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.func]),
  pager: React.PropTypes.func,
  onFilterAction: React.PropTypes.func,
  filterValue: React.PropTypes.string,
};
