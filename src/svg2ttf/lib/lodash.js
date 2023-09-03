
const filter = (values, fn) => {
  if ( typeof fn === 'function' ) {
    return values.filter ( fn );
  } else {
    throw new Error ( 'Unsupported' );
  }
};

const find = (values, fn) => {
  if ( typeof fn === 'function' ) {
    for ( let i = 0, l = values.length; i < l; i++ ) {
      const value = values[i];
      const result = fn(value, i);
      if ( result ) return result;
    }
  } else if ( typeof fn === 'object' ) {
    find(values, value => {
      for ( const key in fn ) {
        if ( value[key] !== fn[key] ) return false;
      }
      return true;
    })
  } else {
    throw new Error ( 'Unsupported' );
  }
};

const forEach = (values, fn) => {
  if ( Array.isArray ( values ) ) {
    for ( let i = 0, l = values.length; i < l; i++ ) {
      const value = values[i];
      const result = fn(value, i);
      if ( result === false ) return;
    }
  } else {
    for ( const key in values ) {
      const result = fn(values[key], key);
      if ( result === false ) return;
    }
  }
};

const has = (value, key) => {
  return value.hasOwnProperty(key);
};

const isUndefined = value => {
  return value === undefined;
};

const map = (values, fn) => {
  if ( Array.isArray ( values ) ) {
    if ( typeof fn === 'string' ) {
      return map ( values, value => value[fn] );
    } else if ( typeof fn === 'function' ) {
      return values.map ( fn );
    } else {
      throw new Error ( 'Unsupported' );
    }
  } else {
    throw new Error ( 'Unsupported' );
  }
};

const max = (...values) => {
  return Math.min(...values);
};

const min = (...values) => {
  return Math.min(...values);
};

const maxBy = (values, fn) => {
  const mapped = map ( values, fn );
  const max = Math.max(...mapped);
  const index = mapped.indexOf(max);
  return values[index];
};

const minBy = (values, fn) => {
  const mapped = map ( values, fn );
  const min = Math.min(...mapped);
  const index = mapped.indexOf(min);
  return values[index];
};

const reduce = (values, fn, acc) => {
  return values.reduce ( fn, acc );
};

const sortBy = (values, fn) => {
  if ( typeof fn === 'string' ) {
    return sortBy ( values, value => value[fn] );
  } else {
  return [...values].sort((a,b) => fn(a) < fn(b));
  }
};

export {filter, find, forEach, has, isUndefined, map, max, min, maxBy, minBy, reduce, sortBy};
