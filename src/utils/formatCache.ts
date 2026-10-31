/**
 * Small bounded cache so repeated formatting (tables with hundreds of cells)
 * does not construct an `Intl` object per call.
 */
export function createCache<V>(limit = 200) {
  const map = new Map<string, V>();
  return {
    get(key: string, create: () => V): V {
      let value = map.get(key);
      if (value === undefined) {
        if (map.size >= limit) map.clear();
        value = create();
        map.set(key, value);
      }
      return value;
    },
  };
}
