
/* IMPORT */

import type {Contour, Point} from './types';

/* HELPERS - UTILS */

const {pow, round, sqrt} = Math;

const getSqrDistance = ( p1: Point, p2: Point ): number => {

  return pow ( p1.x - p2.x, 2 ) + pow ( p1.y - p2.y, 2 );

};

const isInLine = ( p1: Point, m: Point, p2: Point, precision: number ): boolean => {

  const a = getSqrDistance ( p1, m );
  const b = getSqrDistance ( p2, m );
  const c = getSqrDistance ( p1, p2 );

  if ( a > ( b + c ) || b > ( a + c ) ) return false;

  return sqrt ( pow ( ( p1.x - m.x ) * ( p2.y - m.y ) - ( p2.x - m.x ) * ( p1.y - m.y ), 2 ) / c ) < precision;

};

const isMidpoint = ( p1: Point, m: Point, p2: Point, precision: number ): boolean => {

  const expectedX = ( p1.x + p2.x ) / 2;
  const expectedY = ( p1.y + p2.y ) / 2;
  const expectedMidpoint = { x: expectedX, y: expectedY };

  return getSqrDistance ( m, expectedMidpoint ) < pow ( precision, 2 );

};

const isPointEqual = ( p1: Point, p2: Point ): boolean => {

  return p1.x === p2.x && p1.y === p2.y;

};

/* HELPERS - TRANSFORMS */

const straighten = ( contours: Contour[], precision: number ): Contour[] => {

  return contours.map ( contour => {

    for ( let i = contour.length - 2; i > 1; i-- ) {

      const curr = contour[i];
      const prev = contour[i - 1];
      const next = contour[i + 1];

      if ( prev.onCurve && next.onCurve ) {

        if ( isInLine ( prev, curr, next, precision ) ) {

          contour.splice ( i, 1 );

        }

      }

    }

    return contour;

  });

};

const interpolate = ( contours: Contour[], precision: number ): Contour[] => {

  return contours.map ( contour => {

    for ( let i = contour.length - 2; i > 1; i-- ) {

      const curr = contour[i];
      const prev = contour[i - 1];
      const next = contour[i + 1];

      if ( !prev.onCurve && curr.onCurve && !next.onCurve ) {

        if ( isMidpoint ( prev, curr, next, precision ) ) {

          contour.splice ( i, 1 );

        }

      }


    }

    return contour;

  });

};

const roundPoints = ( contours: Contour[] ): Contour[] => {

  return contours.map ( contour => {

    for ( let i = 0, l = contour.length; i < l; i++ ) {

      const point = contour[i];

      point.x = round ( point.x );
      point.y = round ( point.y );

    }

    return contour;

  });

};

const removeClosingReturnPoints = ( contours: Contour[] ): Contour[] => {

  return contours.map ( contour => {

    const length = contour.length;

    if ( length > 1 && isPointEqual ( contour[0], contour[length - 1] ) ) {

      contour.splice ( length - 1 );

    }

    return contour;

  });

};

const removeEmptyContours = ( contours: Contour[] ): Contour[] => {

  return contours.filter ( contour => contour.length > 1 );

};

/* MAIN */

const getOptimizedContours = ( contours: Contour[] ): Contour[] => {

  contours = straighten ( contours, 0.3 );
  contours = straighten ( contours, 0.3 );
  contours = interpolate ( contours, 1.1 );
  contours = roundPoints ( contours );
  contours = removeClosingReturnPoints ( contours );
  contours = removeEmptyContours ( contours );

  return contours;

};

/* EXPORT */

export default getOptimizedContours;
