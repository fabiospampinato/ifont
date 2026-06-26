
/* IMPORT */

import {ICON_SIZE} from './constants';
import svg2ttf from './svg2ttf';
import type {Icon, Options} from './types';

/* MAIN */

const ifont = ( options: Options ): Uint8Array => {

  const icons = options.icons;
  const size = options.size || ICON_SIZE;

  return svg2ttf ( icons, { size } );

};

/* EXPORT */

export default ifont;
export type {Icon, Options};
