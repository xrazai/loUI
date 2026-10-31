/** Detection of raw color values in strings. */

const NAMED = new Set(
  (
    'aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown ' +
    'burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan ' +
    'darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid ' +
    'darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet ' +
    'deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ' +
    'ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki ' +
    'lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow ' +
    'lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray ' +
    'lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine ' +
    'mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise ' +
    'mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab ' +
    'orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru ' +
    'pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown ' +
    'seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan ' +
    'teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen'
  ).split(' '),
);

const HEX = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![0-9a-z_-])/i;
const FUNCTIONAL = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/i;
const WORD = /(?<![\w#.-])[a-z]+(?![\w(-])/gi;

/** Properties whose value is a color or contains one, where bare color names are checked too. */
export const COLOR_PROPERTY =
  /color|background|border|outline|fill|stroke|shadow|accent|caret|decoration|column-?rule/i;

/**
 * The first raw color found in `value`, or null. `var(--name)` references and `url(...)` are
 * ignored; `transparent`, `currentColor` and `inherit` are never raw colors. Bare color names are
 * only looked for when `named` is true (a property that holds colors).
 */
export function findRawColor(value, { named }) {
  const cleaned = value.replace(/url\([^)]*\)/gi, '').replace(/var\(\s*--[\w-]+/gi, 'var(');
  const hex = HEX.exec(cleaned);
  if (hex) return hex[0];
  const functional = FUNCTIONAL.exec(cleaned);
  if (functional) return `${functional[0]}...)`;
  if (named) {
    for (const match of cleaned.matchAll(WORD)) {
      if (NAMED.has(match[0].toLowerCase())) return match[0];
    }
  }
  return null;
}
