import { defineMessages, plural } from '../../i18n';

export const messages = defineMessages({
  en: {
    /**
     * Instructions linked to the chart with `aria-describedby`. `count` is the number of data
     * points; `formatted` is the same number formatted for the locale.
     */
    instructions: (count: number, formatted: string) =>
      plural('en', count, {
        zero: 'No data points.',
        one: '1 data point. Use the arrow keys to move between points.',
        other: `${formatted} data points. Use the left and right arrow keys to move between points, Home and End for the first and last.`,
      }),
    /**
     * Announced (polite) when the user moves to a point. `value` is already formatted;
     * `note` is the highlight text of the point, if any ("Today").
     */
    point: (label: string, value: string, position: string, count: string, note?: string) =>
      `${label}: ${value}${note ? `, ${note}` : ''}. ${position} of ${count}`,
    /** Caption of the visually hidden data table. `name` is the accessible name of the chart, if it has a text one. */
    tableCaption: (name?: string) => (name ? `Data for ${name}` : 'Chart data'),
    /** Header of the category column of the data table, unless `categoryLabel` is given. */
    category: 'Category',
    /** Header of the value column of the data table, unless `valueLabel` is given. */
    value: 'Value',
    /** Header of the note column of the data table (shown when a point is highlighted). */
    note: 'Note',
    /** Name of the `average` reference line kind (dash pattern: long dashes). */
    average: 'Average',
    /** Name of the `target` reference line kind (dash pattern: dash and dot). */
    target: 'Target',
    /**
     * Read form of one reference line, used in the description and as the row header in the
     * data table. `kind` is the "Average" / "Target" message; `label` is the author's text.
     */
    referenceLine: (kind: string, label: string) =>
      label.trim().toLowerCase() === kind.toLowerCase() ? kind : `${kind}, ${label}`,
    /** Sentence added to the description. `items` is the joined list of "kind, label: value". */
    referenceSummary: (items: string) => `Reference lines: ${items}.`,
    /** Text shown inside the plot when there is no data. */
    empty: 'No data to show',
  },
  'pt-BR': {
    instructions: (count: number, formatted: string) =>
      plural('pt-BR', count, {
        zero: 'Nenhum ponto de dados.',
        one: '1 ponto de dados. Use as setas para mover entre os pontos.',
        other: `${formatted} pontos de dados. Use as setas para a esquerda e para a direita para mover entre os pontos, Home e End para o primeiro e o último.`,
      }),
    point: (label: string, value: string, position: string, count: string, note?: string) =>
      `${label}: ${value}${note ? `, ${note}` : ''}. ${position} de ${count}`,
    tableCaption: (name?: string) => (name ? `Dados de ${name}` : 'Dados do gráfico'),
    category: 'Categoria',
    value: 'Valor',
    note: 'Observação',
    average: 'M�dia',
    target: 'Meta',
    referenceLine: (kind: string, label: string) =>
      label.trim().toLowerCase() === kind.toLowerCase() ? kind : `${kind}, ${label}`,
    referenceSummary: (items: string) => `Linhas de refer�ncia: ${items}.`,
    empty: 'Nenhum dado para mostrar',
  },
});
