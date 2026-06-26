
/* IMPORT */

import Buffer, {writeU8, writeU16, writeI16, writeU32, writeI32} from '../objects/buffer';
import {getFontMaxContext, getFontFirstCharIndex, getFontLastCharIndex} from '../objects/font';
import {chars2number, trunc} from '../utils';
import type {Font, Options} from '../types';

/* MAIN */

//URL: http://www.microsoft.com/typography/otspec/os2.htm

const createOS2Table = ( font: Font, { size }: Options ): Buffer => {

  const buffer = new Buffer ( 96 );

  writeU16 ( buffer, 4 ); // version, v4
  writeI16 ( buffer, size ); // xAvgCharWidth
  writeU16 ( buffer, 400 ); // usWeightClass
  writeU16 ( buffer, 5 ); // usWidthClass
  writeI16 ( buffer, 0 ); // fsType
  writeI16 ( buffer, trunc ( size * 0.6347 ) ); // ySubscriptXSize
  writeI16 ( buffer, trunc ( size * 0.7 ) ); // ySubscriptYSize
  writeI16 ( buffer, 0 ); // ySubscriptXOffset
  writeI16 ( buffer, trunc ( size * 0.14 ) ); // ySubscriptYOffset
  writeI16 ( buffer, trunc ( size * 0.6347 ) ); // ySuperscriptXSize
  writeI16 ( buffer, trunc ( size * 0.7 ) ); // ySuperscriptYSize
  writeI16 ( buffer, 0 ); // ySuperscriptXOffset
  writeI16 ( buffer, trunc ( size * 0.48 ) ); // ySuperscriptYOffset
  writeI16 ( buffer, trunc ( size * 0.049 ) ); // yStrikeoutSize
  writeI16 ( buffer, trunc ( size * 0.258 ) ); // yStrikeoutPosition
  writeI16 ( buffer, 0 ); // sFamilyClass
  writeU8 ( buffer, 5 ); // panose.bFamilyType
  writeU8 ( buffer, 0 ); // panose.bSerifStyle
  writeU8 ( buffer, 0 ); // panose.bWeight
  writeU8 ( buffer, 0 ); // panose.bProportion
  writeU8 ( buffer, 0 ); // panose.bContrast
  writeU8 ( buffer, 0 ); // panose.bStrokeVariation
  writeU8 ( buffer, 0 ); // panose.bArmStyle
  writeU8 ( buffer, 0 ); // panose.bLetterform
  writeU8 ( buffer, 0 ); // panose.bMidline
  writeU8 ( buffer, 0 ); // panose.bXHeight
  writeU32 ( buffer, 0 ); // ulUnicodeRange1
  writeU32 ( buffer, 0 ); // ulUnicodeRange2
  writeU32 ( buffer, 0 ); // ulUnicodeRange3
  writeU32 ( buffer, 0 ); // ulUnicodeRange4
  writeU32 ( buffer, chars2number ( 'FaSp' ) ); // achVendID
  writeU16 ( buffer, 0x0040 | 0x0080 ); // fsSelection
  writeU16 ( buffer, getFontFirstCharIndex ( font ) ); // usFirstCharIndex
  writeU16 ( buffer, getFontLastCharIndex ( font ) ); // usLastCharIndex
  writeI16 ( buffer, size ); // sTypoAscender
  writeI16 ( buffer, 0 ); // sTypoDescender
  writeI16 ( buffer, 0 ); // lineGap
  writeI16 ( buffer, size ); // usWinAscent
  writeI16 ( buffer, 0 ); // usWinDescent
  writeI32 ( buffer, 1 ); // ulCodePageRange1
  writeI32 ( buffer, 0 ); // ulCodePageRange2
  writeI16 ( buffer, 0 ); // sxHeight
  writeI16 ( buffer, 0 ); // sCapHeight
  writeU16 ( buffer, 0 ); // usDefaultChar
  writeU16 ( buffer, 0 ); // usBreakChar
  writeU16 ( buffer, getFontMaxContext ( font ) ); // usMaxContext

  return buffer;

};

/* EXPORT */

export default createOS2Table;
