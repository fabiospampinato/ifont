
/* IMPORT */

import getPath from './get_path';
import getContours from './get_contours';
import getOptimizedContours from './get_optimized_contours';
import getRelativeContours from './get_relative_contours';
import type {Contour} from './types';

/* MAIN */

const svg2contours = ( svg: string, size: number ): Contour[] => {

  return getRelativeContours ( getOptimizedContours ( getContours ( getPath ( svg, size ) ) ) );

};

/* EXPORT */

export default svg2contours;
