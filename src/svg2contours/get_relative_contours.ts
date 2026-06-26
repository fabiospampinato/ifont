
/* IMPORT */

import type {Contour} from './types';

/* MAIN */

const getRelativeContours = ( contours: Contour[] ): Contour[] => {

  let xPrev: number = 0;
  let yPrev: number = 0;

  for ( let ci = 0, cl = contours.length; ci < cl; ci++ ) {

    const contour = contours[ci];

    for ( let pi = 0, pl = contour.length; pi < pl; pi++ ) {

      const point = contour[pi];
      const {x, y} = point;

      point.x -= xPrev;
      point.y -= yPrev;

      xPrev = x;
      yPrev = y;

    }

  }

  return contours;

};

/* EXPORT */

export default getRelativeContours;
