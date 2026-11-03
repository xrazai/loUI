import { defineMessages, plural } from '../../i18n';

export const messages = defineMessages({
  en: {
    /**
     * Instructions linked to the chart with `aria-describedby`. `count` is the number of bars;
     * `formatted` is the same number formatted for the locale.
     */
    instructions: (count: number, formatted: string) =>
      plural('en', count, {
        zero: 'No bars.',
        one: '1 bar.',
        other: `${formatted} bars. Use the arrow keys to move between bars, Home and End for the first and last.`,
      }),
    /** One series inside the summary of a bar: "Online 40". Both arguments are already formatted. */
    series: (label: string, value: string) => `${label} ${value}`,
    /**
     * Accessible name of a bar, also shown in the readout. `items` is the list of series joined
     * for the locale ("Online 40 and Store 30"); `total` is the formatted sum of the visible series.
     */
    bar: (label: string, items: string, total: string) => `${label}: ${items}. Total ${total}.`,
    /** Caption of the visually hidden data table. `name` is the accessible name of the chart, if it has a text one. */
    tableCaption: (name?: string) => (name ? `Data for ${name}` : 'Chart data'),
    /** Header of the category column of the data table, unless `categoryLabel` is given. */
    category: 'Category',
    /** Header of the total column of the data table. */
    total: 'Total',
    /** Text shown in place of the bars when there is no data. */
    empty: 'No data to show',
    /** Text shown in place of the bars when every series is hidden through the legend. */
    allHidden: 'All series are hidden. Show one in the legend.',
  },
  'pt-BR': {
    instructions: (count: number, formatted: string) =>
      plural('pt-BR', count, {
        zero: 'Nenhuma barra.',
        one: '1 barra.',
        other: `${formatted} barras. Use as setas para mover entre as barras, Home e End para a primeira e a última.`,
      }),
    series: (label: string, value: string) => `${label} ${value}`,
    bar: (label: string, items: string, total: string) => `${label}: ${items}. Total ${total}.`,
    tableCaption: (name?: string) => (name ? `Dados de ${name}` : 'Dados do gráfico'),
    category: 'Categoria',
    total: 'Total',
    empty: 'Nenhum dado para mostrar',
    allHidden: 'Todas as séries estão ocultas. Mostre uma na legenda.',
  },
});
