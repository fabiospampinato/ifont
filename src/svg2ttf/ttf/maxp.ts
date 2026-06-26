
/* IMPORT */

import Buffer, {writeI32, writeU16} from '../objects/buffer';
import {getFontMaxContours, getFontMaxPoints} from '../objects/font';
import type {Font, Options} from '../types';

/* MAIN */

//URL: http://www.microsoft.com/typography/otspec/maxp.htm

const createMaxpTable = ( font: Font, options: Options ): Buffer => {

  const buffer = new Buffer ( 32 );

  writeI32 ( buffer, 0x10000 ); // version, v1.0
  writeU16 ( buffer, font.glyphs.length ); // numGlyphs
  writeU16 ( buffer, getFontMaxPoints ( font ) ); // maxPoints
  writeU16 ( buffer, getFontMaxContours ( font ) ); // maxContours
  writeU16 ( buffer, 0 ); // maxCompositePoints
  writeU16 ( buffer, 0 ); // maxCompositeContours
  writeU16 ( buffer, 2 ); // maxZones
  writeU16 ( buffer, 0 ); // maxTwilightPoints
  writeU16 ( buffer, 0 ); // maxStorage
  writeU16 ( buffer, 0 ); // maxFunctionDefs
  writeU16 ( buffer, 0 ); // maxInstructionDefs
  writeU16 ( buffer, 0 ); // maxStackElements
  writeU16 ( buffer, 0 ); // maxSizeOfInstructions
  writeU16 ( buffer, 0 ); // maxComponentElements
  writeU16 ( buffer, 0 ); // maxComponentDepth

  return buffer;

};

/* EXPORT */

export default createMaxpTable;
