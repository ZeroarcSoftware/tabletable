# tabletable

## React Simple Table
tabletable is a simple table component written purely in React. It is the result of my frustrations with Griddle and other React tables that are overly prescriptive in how they must be used and make things very difficult to customize and integrate into complex applications.

tabletable takes any sort of data structure and allows you to define your columns' markup and data projections as you like. It is also server-side rendering friendly.

tabletable has some limitations that I hope to address in the future:
- It requires an Immutablejs data structure for its data
- It emits some hardcoded bootstrap styling
- Only pager markup can be switched out for a custom component

If you are interested in helping with any of this, I would gladly take pull requests.

## Using it
To use tabletable:
- Install the component through NPM
- Require it
- Pass it an Immutablejs Sequence of rows, a column definition object, and an optional filter handler.

### Component props
tabletable has the following component props:

#### Required
**data [Immutable.Seq]** - structured source data.

**columns [object[]]** - array of column definition objects.

#### Optional
**rowsPerPage [number]** - number of rows to display per page.

**pagerSize [number]** - number pages to display in pager.

**showPager [bool]** - show/hide the pager.

**showFilter [bool]** - show/hide the filter input.

**pager [React.Component]** - pager component to use in place of default pager.

**onFilterAction [func(filterValue: string)]** - callback function for responding to filter input.

**filterValue [string]** - text to display in search filter.

**rowContext [func(row: object, index: number): Object]** - callback function invoked once per row with row and index arguments and returns an object. This object will be passed to the column definition object. It is intended to alleviate situations where identical expensive computations need to be performed for more than one column.

**rowCssClass [string]** - CSS class(es) to use for row (tr) element.

### Column definition options
Column definitions are a flexible way to get some fairly complex behaviors into the table while also allowing the *shape* of the data to be however you prefer. Each column defines a function that receives the row data and index as arguments and returns a React component that displays the content. This means that you can drive complex behaviors from the state and props of the parent component. The properties available in the definition objects are:

#### Required
**data [func(row: object, index: number)]** - a function that transforms the row data into a React component to be displayed.

#### Optional
**display [string]** - Header value for column. If not defined, the property name for the column object will be used instead.

**headerCssClass [string]** - CSS class(es) to use for header column (th) element.

**elementCssClass [string]** - CSS class(es) to use for row column (td) element.

**visible [bool]** - show/hide the column.

### Contrived Example
    let columnDefs = [
      {
          display: 'Index',
          headerCssClass: 'col-sm-1',
          visible: true,
          data: (row,index,context) => <div>{index}</div>,
      },
      {
          display: 'Name',
          headerCssClass: 'col-sm-10',
          data: row => <div>{row.get('name')}</div>,
      },
      {
          display: 'Created',
          headerCssClass: 'col-sm-1',
          data: row => <div>{row.get('timestamp')}</div>,
      },
    ];

     handleFilterAction(filterValue) {
        console.log('Filter value is: ' + filterValue);
     },

     <Tabletable
        data={myCrazyCustomImmutablejsDataStructure}
        columns={columnDefs}
        onFilterAction={handleFilterAction}
     />

To change pager attributes:

     <Tabletable
        data={myCrazyCustomImmutablejsDataStructure}
        columns={columnDefs}
        onFilterAction={handleFilterAction}
        rowsPerPage={100}
        pagerSize={5}
     />

You can also define a custom pager that will be substituted for the default pager:

     MyCustomPager = require('./mycustompager');

     <Tabletable
        data={myCrazyCustomImmutablejsDataStructure}
        columns={columnDefs}
        onFilterAction={handleFilterAction}
        pager={MyCustomPager}
    />

The custom pager needs to behave similarly and accept the same props as the default pager. I suggest you copy src/Pager.jsx and modify to suit your needs.

## Contributing
First, setup your local environment:

    git clone git@github.com:ZeroarcSoftware/tabletable.git
    cd tabletable
    npm install

Next, build the project (for use in a npm link scenario):

    npm run build

To watch for changes:

    npm run watch

## Issues
Issues are tracked in [Github Issues](https://github.com/ZeroarcSoftware/tabletable/issues)

## Changes
Changes are tracked as [Github Releases](https://github.com/ZeroarcSoftware/tabletable/releases)

