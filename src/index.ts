
/* IMPORT */

import {icons2ttf} from './converters';
import type {Glyph, Icon, Options} from './types';

/* MAIN */

const ifont = ( options: Options ): Uint8Array => {

  return icons2ttf ( options.icons );

};

/* EXPORT */

export default ifont;
export type {Glyph, Icon, Options};
