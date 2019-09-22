// @flow

export function filterMap<A, B>(array: A[], f: (element: A) => ?B): B[] {
  return array.reduce(
    (accumulator: B[], element) => {
      const result = f(element);

      return result ? [...accumulator, result] : accumulator;
    },
    []
  );
}
