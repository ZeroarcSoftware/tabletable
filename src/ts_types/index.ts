// Copyright 2020 Zeroarc Software, LLC
'use strict';

import * as Immutable from 'immutable';
import { ReactElement } from 'react';

export type Data = Immutable.Map<number, any>;

// Row can be anything
export type Row = any;

export type Context = Immutable.Map<any, any> | Immutable.List<any>;

// Columns have specific properties
type Column = {
  display: string,
  headerCssClass?: string,
  elementCssClass?: (Row, number, Context) => string,
  data: (Row, number, Context) => ReactElement<*>,
  visible: boolean,
};

export type Columns = Array<Column>;
