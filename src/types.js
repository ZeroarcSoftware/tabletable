// @flow
// Copyright 2018 Zeroarc Software, LLC

import Immutable from "immutable";

// Data can be any shape as long as it is Iterable
export type Data = Immutable.Map<number, any>;

// Row can be anything
export type Row = any;

export type Context = Immutable.Map<any, any> | Immutable.List<any>;

// Columns have specific properties
type Column = {
  display: string,
  headerCssClass?: string,
  elementCssClass?: (Row, number, Context) => string,
  data: (Row, number, Context) => React$Element<*>,
  visible: boolean,
};

export type Columns = Array<Column>;

qq;
