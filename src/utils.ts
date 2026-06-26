
/* MAIN */

const castArray = <T> ( value: T[] | T ): T[] => {

  return Array.isArray ( value ) ? value : [value];

};

const without = <T> ( values: T[], value: T ): T[] => {

  return values.filter ( other => other !== value );

};

/* EXPORT */

export {castArray, without};
