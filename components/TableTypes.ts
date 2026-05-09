import React from "react";

export interface TableColumn {
  header: string;
  key: string;
  className?: string;
  render?: (row: any, index: number) => React.ReactNode;
  width?: string;
}

export interface BaseTableProps {
  columns: TableColumn[];
  data: any[];
  isLoading?: boolean;
  emptyMessage?: string;
  idKey: string;
  className?: string;
}
