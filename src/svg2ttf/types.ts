
/* IMPORT */

import type Font from './objects/font';
import type Glyph from './objects/glyph';

/* MAIN - MISC */

type Contour = Array<{
  x: number,
  y: number,
  onCurve: boolean
}>;

type Dict<K extends number | string | symbol, V> = Partial<Record<K, V>>;

type Icon = {
  svg: string,
  name: string
};

type Ligature = {
  unicode: number[],
  glyph: Glyph
};

type LigatureGroup = {
  ligatures: Ligature[],
  startGlyph: Glyph
};

/* MAIN - OPTIONS */

type FontOptions = {
  glyphs: Glyph[],
  ligatures: Ligature[],
  glyphByCodePoint: Dict<string, Glyph>
};

type GlyphOptions = {
  id: number,
  svg: string,
  height: number,
  width: number
};

type Options = {
  size: number
};

/* EXPORT */

export type {Contour, Dict, Icon, Ligature, LigatureGroup};
export type {FontOptions, GlyphOptions, Options};
export type {Font, Glyph};
