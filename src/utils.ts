
/* MAIN */

const memoize = <T, U> ( fn: ( arg: T ) => U ): (( arg: T ) => U) => {

  const cache = new Map<T, U> ();

  return ( arg: T ): U => {

    const cached = cache.get ( arg );

    if ( cached || cache.has ( arg ) ) return cached!;

    const result = fn ( arg );

    cache.set ( arg, result );

    return result;

  };

};

/* EXPORT */

export {memoize};
