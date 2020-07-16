// Copyright 2020 Zeroarc Software, LLC
'use strict';

import * as Immutable from 'immutable';

export type Data = Immutable.List<Immutable.Map<string, any>>;

export type Row = Immutable.Map<string, any>;

export type Context = Immutable.Map<any, any> | Immutable.List<any>;

// Column specific properties
export type Column = {
  create?: () => React.ReactNode,
  data: (Row: any, number: number, Context: any) => React.ReactNode,
  edit?: (Row: any, number: number, Context: any) => React.ReactNode,
  display: string,
  elementCssClass?: (Row: any, number: number, Context: any) => string,
  headerCssClass?: string,
  key?: string, // Key is only required when sorting.
  sortable?: boolean,
  visible?: boolean,
};

export type SortDirection = 'asc' | 'desc';
export type SortCriteria = { key: string, direction: SortDirection };
export type TableMode = 'create' | 'edit' | 'display';