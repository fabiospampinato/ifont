
/* IMPORT */

import Buffer, {writeU16, writeU32} from '../objects/buffer';
import {isFontShortFormat} from '../objects/font';
import type {Font, Options} from '../types';

/* MAIN */

//URL: http://www.microsoft.com/typography/otspec/loca.htm

const createLocaTable = ( font: Font, options: Options ): Buffer => {

  const isU16 = isFontShortFormat ( font );
  const writeOffset = isU16 ? writeU16 : writeU32;

  const bufferLength = ( isU16 ? 2 : 4 ) * ( font.glyphs.length + 1 );
  const buffer = new Buffer ( bufferLength );

  let offset = 0;

  for ( const glyph of font.glyphs ) {

    writeOffset ( buffer, offset );

    offset += glyph.size / ( isU16 ? 2 : 1 );

  }

  writeOffset ( buffer, offset );

  return buffer;

};

/* EXPORT */

export default createLocaTable;
