export type Nullable<T> = T | null;

export const shuffle = <T>(array: T[]): T[] => {
  let m = array.length;
  while (m) {
    const i = Math.floor(Math.random() * m--);
    [array[m], array[i]] = [array[i], array[m]];
  }
  return array;
};
