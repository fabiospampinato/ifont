
/* IMPORT */

import Buffer, {writeU16, writeI16, writeU32, writeI32, writeU64} from '../objects/buffer';
import {isFontShortFormat} from '../objects/font';
import type {Font, Options} from '../types';

/* MAIN */

//URL: http://www.microsoft.com/typography/otspec/head.htm

const createHeadTable = ( font: Font, { size }: Options ): Buffer => {

  const buffer = new Buffer ( 54 );

  writeI32 ( buffer, 0x10000 ); // version, v1
  writeI32 ( buffer, 0x10000 ); // fontRevision, v1
  writeU32 ( buffer, 0 ); // checkSumAdjustment
  writeU32 ( buffer, 0x5F0F3CF5 ); // magicNumber
  writeU16 ( buffer, 0b1001 ); // flags
  writeU16 ( buffer, size ); // unitsPerEm
  writeU64 ( buffer, 0 ); // created
  writeU64 ( buffer, 0 ); // modified
  writeI16 ( buffer, 0 ); // xMin
  writeI16 ( buffer, 0 ); // yMin
  writeI16 ( buffer, size ); // xMax
  writeI16 ( buffer, size ); // yMax
  writeU16 ( buffer, 0 ); // macStyle
  writeU16 ( buffer, 8 ); // lowestRecPPEM
  writeI16 ( buffer, 2 ); // fontDirectionHint
  writeI16 ( buffer, isFontShortFormat ( font ) ? 0 : 1 ); // indexToLocFormat
  writeI16 ( buffer, 0 ); // glyphDataFormat

  return buffer;

};

/* EXPORT */

export default createHeadTable;
