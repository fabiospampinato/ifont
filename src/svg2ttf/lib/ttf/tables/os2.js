'use strict';

// See documentation here: http://www.microsoft.com/typography/otspec/os2.htm

import * as _ from '../../lodash.js';
import {identifier} from '../utils.js';
import ByteBuffer from 'microbuffer';

//get first glyph unicode
function getFirstCharIndex(font) {
  return Math.max(0, Math.min(0xffff, Math.abs(_.minBy(Object.keys(font.codePoints), function (point) {
    return parseInt(point, 10);
  }))));
}

//get last glyph unicode
function getLastCharIndex(font) {
  return Math.max(0, Math.min(0xffff, Math.abs(_.maxBy(Object.keys(font.codePoints), function (point) {
    return parseInt(point, 10);
  }))));
}

// OpenType spec: https://docs.microsoft.com/en-us/typography/opentype/spec/os2
function createOS2Table(font) {

  // use at least 2 for ligatures and kerning
  var maxContext = font.ligatures.map(function (l) {
    return l.unicode.length;
  }).reduce(function (a, b) {
    return Math.max(a, b);
  }, 2);

  var buf = new ByteBuffer(96);

  // Version 5 is not supported in the Android 5 browser.
  buf.writeUint16(4); // version
  buf.writeInt16(font.avgWidth); // xAvgCharWidth
  buf.writeUint16(font.weightClass); // usWeightClass
  buf.writeUint16(font.widthClass); // usWidthClass
  buf.writeInt16(font.fsType); // fsType
  buf.writeInt16(font.ySubscriptXSize); // ySubscriptXSize
  buf.writeInt16(font.ySubscriptYSize); //ySubscriptYSize
  buf.writeInt16(font.ySubscriptXOffset); // ySubscriptXOffset
  buf.writeInt16(font.ySubscriptYOffset); // ySubscriptYOffset
  buf.writeInt16(font.ySuperscriptXSize); // ySuperscriptXSize
  buf.writeInt16(font.ySuperscriptYSize); // ySuperscriptYSize
  buf.writeInt16(font.ySuperscriptXOffset); // ySuperscriptXOffset
  buf.writeInt16(font.ySuperscriptYOffset); // ySuperscriptYOffset
  buf.writeInt16(font.yStrikeoutSize); // yStrikeoutSize
  buf.writeInt16(font.yStrikeoutPosition); // yStrikeoutPosition
  buf.writeInt16(font.familyClass); // sFamilyClass
  buf.writeUint8(font.panose.familyType); // panose.bFamilyType
  buf.writeUint8(font.panose.serifStyle); // panose.bSerifStyle
  buf.writeUint8(font.panose.weight); // panose.bWeight
  buf.writeUint8(font.panose.proportion); // panose.bProportion
  buf.writeUint8(font.panose.contrast); // panose.bContrast
  buf.writeUint8(font.panose.strokeVariation); // panose.bStrokeVariation
  buf.writeUint8(font.panose.armStyle); // panose.bArmStyle
  buf.writeUint8(font.panose.letterform); // panose.bLetterform
  buf.writeUint8(font.panose.midline); // panose.bMidline
  buf.writeUint8(font.panose.xHeight); // panose.bXHeight
  // TODO: This field is used to specify the Unicode blocks or ranges based on the 'cmap' table.
  buf.writeUint32(0); // ulUnicodeRange1
  buf.writeUint32(0); // ulUnicodeRange2
  buf.writeUint32(0); // ulUnicodeRange3
  buf.writeUint32(0); // ulUnicodeRange4
  buf.writeUint32(identifier('PfEd')); // achVendID, equal to PfEd
  buf.writeUint16(font.fsSelection); // fsSelection
  buf.writeUint16(getFirstCharIndex(font)); // usFirstCharIndex
  buf.writeUint16(getLastCharIndex(font)); // usLastCharIndex
  buf.writeInt16(font.ascent); // sTypoAscender
  buf.writeInt16(font.descent); // sTypoDescender
  buf.writeInt16(font.lineGap); // lineGap
  // Enlarge win acscent/descent to avoid clipping
  // WinAscent - WinDecent should at least be equal to TypoAscender - TypoDescender + TypoLineGap:
  // https://www.high-logic.com/font-editor/fontcreator/tutorials/font-metrics-vertical-line-spacing
  buf.writeInt16(Math.max(font.yMax, font.ascent + font.lineGap)); // usWinAscent
  buf.writeInt16(-Math.min(font.yMin, font.descent)); // usWinDescent
  buf.writeInt32(1); // ulCodePageRange1, Latin 1
  buf.writeInt32(0); // ulCodePageRange2
  buf.writeInt16(font.xHeight); // sxHeight
  buf.writeInt16(font.capHeight); // sCapHeight
  buf.writeUint16(0); // usDefaultChar, pointing to missing glyph (always id=0)
  buf.writeUint16(0); // usBreakChar, code=32 isn't guaranteed to be a space in icon fonts
  buf.writeUint16(maxContext); // usMaxContext, use at least 2 for ligatures and kerning

  return buf;
}

export default createOS2Table;
