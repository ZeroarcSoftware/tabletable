# tabletable

## Reactjs Simple Table

tabletable is a simple table component written purely in ReactJS. It is the result of my frustrations with Griddle and other React tables that are overly prescriptive in how they must be used and make things very difficult to customize and integrate into complex applications.

tabletable takes any sort of data structure (provided it is Immutable) and allows you to define your columns' markup and data projections as you like.

tabletable has some limitations that I hope to address in the future:
- It requires Immutablejs for its data
- It emits some hardcoded bootstrap styling
- Only pager markup can be switched out for a custom component

If you are interested in helping with any of this, I would gladly take pull requests.

## Using it

To use tabletable:
- Install the component through NPM
- Require it
- Pass it an Immutablejs Sequence of rows, a column definition object, and an optional filter handler.

Example:

    let columnDefs = {
      index: {
          display: 'Index',
          cssClass: 'col-sm-1',
          visible: true,
          data: (row,index) => <div>{index}</div>,
      },
      name: {
          display: 'Name',
          cssClass: 'col-sm-10',
          data: row => <div>{row.get('name')}</div>,
      },
      timestamp: {
          display: 'Created',
          cssClass: 'col-sm-1',
          data: row => <div>{row.get('timestamp')}</div>,
      },
    };


     handleFilterAction(filterValue) {
        console.log('Filter value is: ' + filterValue);
     },


     <Tabletable
        data={myCrazyCustomImmutablejsDataStructure}
        columns={columnDefs}
        onFilterAction={handleFilterAction}
     />

Optionally, you can define a custom pager that will be substituted for the default pager:

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

## Todo

- Make tabletable handle non-Immutablejs data structures
- Remove/optionalize Bootstrap styling
- Make all markup swappable for custom components
