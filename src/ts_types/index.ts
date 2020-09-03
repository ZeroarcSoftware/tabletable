// Copyright 2020 Zeroarc Software, LLC
'use strict';

import * as Immutable from 'immutable';

export type Data = Immutable.List<Immutable.Map<string, any>>;

export type Row = Immutable.Map<string, any>;

export type Context = Immutable.Map<any, any> | Immutable.List<any>;

// Column specific properties
export type Column = {
  create?: (fieldError: boolean) => React.ReactNode,
  data?: (Row: any, number: number, Context: any) => React.ReactNode,
  edit?: (Row: any, number: number, Context: any, fieldError: boolean) => React.ReactNode,
  display: string,
  elementCssClass?: ((Row: any, number: number, Context: any) => string) | string, // Can be a string for function that returns a string
  headerCssClass?: string,
  key?: string, // Key is only required when sorting.
  sortable?: boolean,
  visible?: boolean,
};

export type RowError = {
  key?: string,
  errorMessage: string,
};

export type SortDirection = 'asc' | 'desc';
export type SortCriteria = { key: string, direction: SortDirection };
export type TableMode = 'create' | 'edit' | 'display';