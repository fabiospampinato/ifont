
/* HELPERS */

const {abs, floor, log, max, min, pow, round, sqrt, trunc} = Math;

/* MAIN */

const chars2number = ( chars: string ): number => { // This converts 4 chars to a I32
  return [...chars].reduce ( ( acc, value ) => ( acc << 8 ) + value.charCodeAt ( 0 ), 0 );
};

const clamp = ( value: number, valueMin: number, valueMax: number ): number => {
  return max ( valueMin, min ( valueMax, value ) );
};

const maxBy = <T> ( values: T[], fn: ( value: T ) => number ): number => {
  return values.reduce ( ( acc, value ) => max ( acc, fn ( value ) ), -Infinity );
};

const minBy = <T> ( values: T[], fn: ( value: T ) => number ): number => {
  return values.reduce ( ( acc, value ) => min ( acc, fn ( value ) ), Infinity );
};

const sumBy = <T> ( values: T[], fn: ( value: T ) => number ): number => {
  return values.reduce ( ( acc, value ) => acc + fn ( value ), 0 );
};

/* EXPORT */

export {abs, floor, log, max, min, pow, round, sqrt, trunc};
export {chars2number, clamp, maxBy, minBy, sumBy};
