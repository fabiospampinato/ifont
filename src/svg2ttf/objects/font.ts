
/* IMPORT */

import {clamp, max, maxBy, min, sumBy} from '../utils';
import type {Dict, FontOptions, Glyph, Ligature} from '../types';

/* MAIN */

class Font {

  readonly codePoints: number[];
  readonly glyphs: Glyph[];
  readonly glyphByCodePoint: Dict<number, Glyph>;
  readonly ligatures: Ligature[];

  constructor ( options: FontOptions ) {

    const {glyphs, glyphByCodePoint, ligatures} = options;

    this.codePoints = Object.keys ( glyphByCodePoint ).map ( codePoint => parseInt ( codePoint, 10 ) );
    this.glyphs = glyphs;
    this.glyphByCodePoint = glyphByCodePoint;
    this.ligatures = ligatures;

  }

}

/* UTILITIES */

const getFontMaxContext = ( font: Font ): number => {
  return max ( 2, maxBy ( font.ligatures, ligature => ligature.unicode.length ) );
};

const getFontMaxContours = ( font: Font ): number => {
  return maxBy ( font.glyphs, glyph => glyph.contours.length );
};

const getFontMaxPoints = ( font: Font ): number => {
  return maxBy ( font.glyphs, glyph => sumBy ( glyph.contours, contour => contour.length ) );
};

const getFontFirstCharIndex = ( font: Font ): number => {
  return clamp ( min ( ...font.codePoints ), 0, 0xFFFF );
};

const getFontLastCharIndex = ( font: Font ): number => {
  return clamp ( max ( ...font.codePoints ), 0, 0xFFFF );
};

const getFontGlyphsSize = ( font: Font ): number => {
  return sumBy ( font.glyphs, glyph => glyph.size );
};

const isFontShortFormat = ( font: Font ): boolean => {
  return getFontGlyphsSize ( font ) < 0x20000;
};

/* EXPORT */

export default Font;
export {getFontMaxContext, getFontMaxContours, getFontMaxPoints};
export {getFontFirstCharIndex, getFontLastCharIndex};
export {getFontGlyphsSize, isFontShortFormat};
