
/* IMPORT */

import Buffer, {writeU8, writeI16, writeBytes} from '../objects/buffer';
import {getFontGlyphsSize} from '../objects/font';
import type {Font, Options} from '../types';

/* MAIN */

//URL: http://www.microsoft.com/typography/otspec/glyf.htm

const createGlyfTable = ( font: Font, { size }: Options ): Buffer => {

  const bufferLength = getFontGlyphsSize ( font );
  const buffer = new Buffer ( bufferLength );

  for ( const glyph of font.glyphs ) {

    if ( !glyph.contours.length ) continue;

    const offset = buffer.offset;

    writeI16 ( buffer, glyph.contours.length ); // numberOfContours
    writeI16 ( buffer, 0 ); // xMin
    writeI16 ( buffer, 0 ); // yMin
    writeI16 ( buffer, size ); // xMax
    writeI16 ( buffer, size ); // yMax

    let endPtsOfContours = -1;
    for ( const contour of glyph.contours ) {
      endPtsOfContours += contour.length;
      writeI16 ( buffer, endPtsOfContours ); // endPtsOfContours
    }

    writeI16 ( buffer, 0 ); // instructionLength

    writeBytes ( buffer, glyph.flags ); // flags
    writeBytes ( buffer, glyph.x ); // xCoordinates
    writeBytes ( buffer, glyph.y ); // yCoordinates

    const padding = ( 4 - ( ( buffer.offset - offset ) % 4 ) ) % 4;
    for ( let i = 0; i < padding; i++ ) {
      writeU8 ( buffer, 0 );
    }

  }

  return buffer;

};

/* EXPORT */

export default createGlyfTable;
