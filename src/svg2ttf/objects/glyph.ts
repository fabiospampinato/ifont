
/* IMPORT */

import svg2contours from '../../svg2contours';
import Buffer, {writeU8, writeI16} from './buffer';
import {abs, sumBy} from '../utils';
import type {Contour, Dict, GlyphOptions} from '../types';

/* HELPERS */

const isCoordShort = ( coord: number ): boolean => {

  return -0xFF <= coord && coord <= 0xFF;

};

const getCoordFlag = ( coord: number, shortFlag: number, sameFlag: number ): number => {

  if ( !coord ) return sameFlag;
  if ( !isCoordShort ( coord ) ) return 0;

  return shortFlag + ( coord > 0 ? sameFlag : 0 );

};

const getCoordsBuffer = ( coords: number[] ): Buffer => {

  const bufferLength = sumBy ( coords, coord => isCoordShort ( coord ) ? 1 : 2 );
  const buffer = new Buffer ( bufferLength );

  for ( const coord of coords ) {

    if ( isCoordShort ( coord ) ) {

      writeU8 ( buffer, abs ( coord ) );

    } else {

      writeI16 ( buffer, coord );

    }

  }

  return buffer;

};

const getData = ( contours: Contour[] ): { flags: number[], x: number[], y: number[] } => {

  const flags: number[] = [];
  const x: number[] = [];
  const y: number[] = [];

  let previous = -1;
  let firstRepeat = false;

  for ( const contour of contours ) {

    for ( const point of contour ) {

      const flag = ( point.onCurve ? 1 : 0 ) + getCoordFlag ( point.x, 2, 16 ) + getCoordFlag ( point.y, 4, 32 );

      if ( previous === flag ) {

        if ( firstRepeat ) {

          firstRepeat = false;

          flags[flags.length - 1] += 8;
          flags.push ( 1 );

        } else {

          flags[flags.length - 1] += 1;

        }

      } else {

        previous = flag;
        firstRepeat = true;

        flags.push ( flag );

      }

      if ( point.x ) {

        x.push ( point.x );

      }

      if ( point.y ) {

        y.push ( point.y );

      }

    }

  }

  return { flags, x, y };

};

const getFlagsBuffer = ( flags: number[] ): Uint8Array => {

  return new Uint8Array ( flags );

};

const getGlyphSize = ( glyph: Glyph ): number => {

  if ( !glyph.contours.length ) return 0;

  const {contours, flags, x, y} = glyph;
  const size = 12 + ( 2 * contours.length ) + flags.length + x.length + y.length;
  const padding = ( 4 - ( size % 4 ) ) % 4;
  const sizeWithPadding = size + padding;

  return sizeWithPadding;

};

/* MAIN */

class Glyph {

  readonly id: number;
  readonly height: number;
  readonly width: number;

  readonly contours: Contour[];
  readonly flags: Uint8Array;
  readonly size: number;
  readonly x: Uint8Array;
  readonly y: Uint8Array;

  constructor ( options: GlyphOptions ) {

    const {id, svg, height, width} = options;
    const size = Math.min ( height, width );

    this.id = id;
    this.height = height;
    this.width = width;

    const contours = svg ? svg2contours ( svg, size ) : [];
    const data = getData ( contours );

    this.contours = contours;
    this.flags = getFlagsBuffer ( data.flags );
    this.x = getCoordsBuffer ( data.x );
    this.y = getCoordsBuffer ( data.y );
    this.size = getGlyphSize ( this );

  }

}

/* UTILITIES */

const getGlyph = (() => { // A fast cached factory for Glyphs, for faster incremental generation

  const cache: Dict<number, Dict<number, Dict<number, Dict<string, Glyph>>>> = {};

  return ( options: GlyphOptions ): Glyph => {

    const {id, svg, height, width} = options;

    const cacheById = ( cache[id] ??= {} );
    const cacheByHeight = ( cacheById[height] ??= {} );
    const cacheByWidth = ( cacheByHeight[width] ??= {} );
    const cachedGlyph = ( cacheByWidth[svg] ??= new Glyph ( options ) );

    return cachedGlyph;

  };

})();

/* EXPORT */

export default Glyph;
export {getGlyph};
