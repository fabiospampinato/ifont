
/* IMPORT */

import cubicToQuad from 'cubic2quad';
import svgPath from 'svgpath';
import type {Contour} from './types';

/* HELPERS */

const cubic2quad = ( segment: Array<string | number>, index: number, p1x: number, p1y: number, precision: number = 0.3 ): Array<Array<string | number>> | undefined => {

  if ( segment[0] !== 'C' ) return;

  const c1x = +segment[1];
  const c1y = +segment[2];
  const c2x = +segment[3];
  const c2y = +segment[4];
  const p2x = +segment[5];
  const p2y = +segment[6];

  const curves = cubicToQuad ( p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, precision );
  const segments: Array<Array<string | number>> = [];

  for ( let i = 2, l = curves.length; i < l; i += 4 ) {

    const segment = ['Q', curves[i], curves[i + 1], curves[i + 2], curves[i + 3]];

    segments.push ( segment );

  }

  return segments;

};

const path2contours = ( path: typeof svgPath ): Contour[] => {

  let contours: Contour[] = [];
  let contour: Contour = [];

  path.iterate ( ( segment, index, x, y ) => {

    if ( index === 0 || segment[0] === 'M' || segment[0] === 'Z' ) {

      contour = [];
      contours.push ( contour );

    }

    const name = segment[0];

    if ( name === 'Q' ) {

      const x = +segment[1] || 0;
      const y = +segment[2] || 0;

      contour.push ({ x, y, onCurve: false });

    }

    if ( name === 'H' ) {

      const x = +segment[1] || 0;

      contour.push ({ x, y, onCurve: true });

    } else if ( name === 'V' ) {

      const y = +segment[1] || 0;

      contour.push ({ x, y, onCurve: true });

    } else if ( name !== 'Z' ) {

      const x = +segment[segment.length - 2] || 0;
      const y = +segment[segment.length - 1] || 0;

      contour.push ({ x, y, onCurve: true });

    }

  });

  return contours;

};

/* MAIN */

const getContours = ( path: string ): Contour[] => {

  const pathWithQuads = svgPath ( path ).abs ().unshort ().unarc ().iterate ( cubic2quad );
  const contours = path2contours ( pathWithQuads );

  return contours;

};

/* EXPORT */

export default getContours;
