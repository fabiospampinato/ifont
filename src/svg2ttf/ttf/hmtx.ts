
/* IMPORT */

import Buffer, {writeI16, writeU16} from '../objects/buffer';
import type {Font, Options} from '../types';

/* MAIN */

//URL: http://www.microsoft.com/typography/otspec/hmtx.htm

const createHmtxTable = ( font: Font, options: Options ): Buffer => {

  const buffer = new Buffer ( 4 * font.glyphs.length );

  for ( const glyph of font.glyphs ) {

    writeU16 ( buffer, glyph.width ); // advanceWidth
    writeI16 ( buffer, 0 ); // lsb

  }

  return buffer;

};

/* EXPORT */

export default createHmtxTable;
