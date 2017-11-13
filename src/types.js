// @flow
// Copyright 2017 Zeroarc Software, LLC

import * as Immutable from 'immutable';


// Data can be any shape as long as it is Iterable
export type Data = Immutable.Iterable<number,any>;

// Row can be anything
export type Row = any;

export type Context = Immutable.Map<any,any> | Immutable.List<any>;

// Columns have specific properties
type Column = {
  display: string,
  headerCssClass?: string,
  elementCssClass?: (Row,number,Context) => string,
  data: (Row,number,Context) => React$Element<*>
};
export type Columns = Array<Column>;

