
/* IMPORT */

import Buffer from './objects/buffer';
import Font from './objects/font';
import Glyph, {getGlyph} from './objects/glyph';
import createTTF from './ttf';
import {castArray} from './utils';
import type {Dict, Icon, Ligature, Options} from './types';

/* MAIN */

const svg2ttf = ( icons: Icon[], options: Options ): Buffer => {

  const glyphs: Glyph[] = [];
  const glyphByCodePoint: Dict<number, Glyph> = {};
  const ligatures: Ligature[] = [];

  /* NOTDEF GLYPH */

  let glyphId = 0;

  const notdefGlyph = getGlyph ({
    id: glyphId++,
    svg: '',
    height: 0,
    width: 0
  });

  glyphs.push ( notdefGlyph );

  /* ICON GLYPHS */

  for ( const icon of icons ) {

    /* LIGATURE GLYPH */

    const ligatureGlyph = getGlyph ({
      id: glyphId++,
      svg: icon.svg,
      height: options.size,
      width: options.size
    });

    glyphs.push ( ligatureGlyph );

    /* CODE POINTS & LIGATURES */

    for ( const name of castArray ( icon.name ) ) {

      const unicode = [...name].map ( char => char.charCodeAt ( 0 ) );

      for ( const codePoint of unicode ) {

        if ( glyphByCodePoint[codePoint] ) continue;

        const codePointGlyph = getGlyph ({
          id: glyphId++,
          svg: '',
          height: 0,
          width: 0
        });

        glyphByCodePoint[codePoint] = codePointGlyph;
        glyphs.push ( codePointGlyph );

      }

      ligatures.push ({ unicode, glyph: ligatureGlyph });

    }

  }

  /* TTF */

  const font = new Font ({ glyphs, glyphByCodePoint, ligatures });
  const ttf = createTTF ( font, options );

  return ttf;

};

/* EXPORT */

export default svg2ttf;
