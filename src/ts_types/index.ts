// Copyright 2020 Zeroarc Software, LLC
'use strict';

import * as Immutable from 'immutable';
import { ReactElement } from 'react';

export type Data = Immutable.Map<number, any>;

export type Row = any;

export type Context = Immutable.Map<any, any> | Immutable.List<any>;

// Column specific properties
type Column = {
  data: (Row: any, number: number, Context: any) => React.ReactNode,
  display: string,
  elementCssClass?: (Row: any, number: number, Context: any) => string,
  headerCssClass?: string,
  key?: string, // Key is only required when sorting.
  sortable?: boolean,
  visible: boolean,
};

export type Columns = Array<Column>;
