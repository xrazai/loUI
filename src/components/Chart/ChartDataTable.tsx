import type { ReactNode } from 'react';
import { VisuallyHidden } from '../VisuallyHidden';

export interface ChartDataTableRow {
  /** Row header: the category. */
  header: string;
  /** One cell per column after the category column. */
  cells: readonly ReactNode[];
}

export interface ChartDataTableProps {
  caption: string;
  /** Column headers, category column first. */
  columns: readonly string[];
  rows: readonly ChartDataTableRow[];
  /** Summary rows after the data (reference lines): row header and one cell for the value column. */
  footerRows?: readonly ChartDataTableRow[];
}

/**
 * The visually hidden data table every chart carries as its text alternative (internal). The
 * wrapper clips the table: a table ignores `overflow` and would otherwise stretch the page.
 */
export function ChartDataTable({ caption, columns, rows, footerRows = [] }: ChartDataTableProps) {
  return (
    <VisuallyHidden as="div">
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <th scope="row">{row.header}</th>
              {row.cells.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
        {footerRows.length ? (
          <tfoot>
            {footerRows.map((row, index) => (
              <tr key={index}>
                <th scope="row">{row.header}</th>
                {row.cells.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tfoot>
        ) : null}
      </table>
    </VisuallyHidden>
  );
}
