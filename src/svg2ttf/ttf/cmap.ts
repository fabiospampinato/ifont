
/* IMPORT */

import Buffer, {writeU16, writeU32, writeBytes} from '../objects/buffer';
import type {Font, Options} from '../types';

/* HELPERS */

const createFormat12Table = ( font: Font ): Buffer => {

  const bufferLength = 16 + ( 12 * font.codePoints.length ); // header + code points
  const buffer = new Buffer ( bufferLength );

  writeU32 ( buffer, 0xC0000 ); // format, 12
  writeU32 ( buffer, bufferLength ); // length
  writeU32 ( buffer, 0 ); // language
  writeU32 ( buffer, font.codePoints.length ); // nGroups

  for ( const codePoint of font.codePoints ) {

    writeU32 ( buffer, codePoint ); // startCharCode
    writeU32 ( buffer, codePoint ); // endCharCode
    writeU32 ( buffer, font.glyphByCodePoint[codePoint]?.id ?? 0 ); // startGlyphCode

  }

  return buffer;

};

/* MAIN */

//URL: http://www.microsoft.com/typography/otspec/cmap.htm

const createCmapTable = ( font: Font, options: Options ): Buffer => {

  const table = createFormat12Table ( font );
  const tableOffset = 20;

  const buffer = new Buffer ( tableOffset + table.length );

  writeU16 ( buffer, 0 ); // version
  writeU16 ( buffer, 2 ); // count

  writeU16 ( buffer, 0 ); // platform - unicode
  writeU16 ( buffer, 4 ); // encoding
  writeU32 ( buffer, tableOffset ); // offset

  writeU16 ( buffer, 3 ); // platform - microsoft
  writeU16 ( buffer, 10 ); // encoding
  writeU32 ( buffer, tableOffset ); // offset

  writeBytes ( buffer, table ); // table

  return buffer;

};

/* EXPORT */

export default createCmapTable;
