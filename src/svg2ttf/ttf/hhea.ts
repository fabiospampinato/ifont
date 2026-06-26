
/* IMPORT */

import Buffer, {writeU16, writeI16, writeI32} from '../objects/buffer';
import type {Font, Options} from '../types';

/* MAIN */

//URL: http://www.microsoft.com/typography/otspec/hhea.htm

const createHheaTable = ( font: Font, { size }: Options ): Buffer => {

  const buffer = new Buffer ( 36 );

  writeI32 ( buffer, 0x10000 ); // version, v1.0
  writeI16 ( buffer, size ); // ascender
  writeI16 ( buffer, 0 ); // descender
  writeI16 ( buffer, 0 ); // lineGap
  writeU16 ( buffer, size ); // advanceWidthMax
  writeI16 ( buffer, 0 ); // minLeftSideBearing
  writeI16 ( buffer, 0 ); // minRightSideBearing
  writeI16 ( buffer, size ); // xMaxExtent
  writeI16 ( buffer, 1 ); // caretSlopeRise
  writeI16 ( buffer, 0 ); // caretSlopeRun
  writeU16 ( buffer, 0 ); // reserved1
  writeU16 ( buffer, 0 ); // reserved2
  writeU16 ( buffer, 0 ); // reserved3
  writeU16 ( buffer, 0 ); // reserved4
  writeU16 ( buffer, 0 ); // reserved5
  writeI16 ( buffer, 0 ); // metricDataFormat
  writeU16 ( buffer, font.glyphs.length ); // numberOfHMetrics

  return buffer;

};

/* EXPORT */

export default createHheaTable;
