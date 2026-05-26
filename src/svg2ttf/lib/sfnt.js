'use strict';

import * as _ from './lodash.js';
import toTTF from './ttf.js';

class Font {
  constructor() {
  this.ascent = 850;
  this.copyright = '';
  this.createdDate = new Date();
  this.glyphs = [];
  this.ligatures = [];
  // Maping of code points to glyphs.
  // Keys are actually numeric, thus should be `parseInt`ed.
  this.codePoints = {};
  this.isFixedPitch = 0;
  this.italicAngle = 0;
  this.familyClass = 0; // No Classification
  this.familyName = '';

  // 0x40 - REGULAR - Characters are in the standard weight/style for the font
  // 0x80 - USE_TYPO_METRICS - use OS/2.sTypoAscender - OS/2.sTypoDescender + OS/2.sTypoLineGap as the default line spacing
  // https://docs.microsoft.com/en-us/typography/opentype/spec/os2#fsselection
  // https://github.com/fontello/svg2ttf/issues/95
  this.fsSelection = 0x40 | 0x80;

  // Non zero value can cause issues in IE, https://github.com/fontello/svg2ttf/issues/45
  this.fsType = 0;
  this.lowestRecPPEM = 8;
  this.macStyle = 0;
  this.modifiedDate = new Date();
  this.panose = {
    familyType: 2, // Latin Text
    serifStyle: 0, // any
    weight: 5, // book
    proportion: 3, //modern
    contrast: 0, //any
    strokeVariation: 0, //any,
    armStyle: 0, //any,
    letterform: 0, //any,
    midline: 0, //any,
    xHeight: 0 //any,
  };
  this.revision = 1;
  this.sfntNames = [];
  this.underlineThickness = 0;
  this.unitsPerEm = 1000;
  this.weightClass = 400; // normal
  this.width = 1000;
  this.widthClass = 5; // Medium (normal)
  this.ySubscriptXOffset = 0;
  this.ySuperscriptXOffset = 0;
  this.int_descent = -150;
  this.xHeight = 0;
  this.capHeight = 0;
  }

  //getters and setters

  get descent() {
    return this.int_descent;
  }
  set descent(value) {
    this.int_descent = parseInt(Math.round(-Math.abs(value)), 10);
  }

  get avgCharWidth() {
    if (this.glyphs.length === 0) {
      return 0;
    }
    var widths = _.map(this.glyphs, 'width');

    return parseInt(widths.reduce(function (prev, cur) {
      return prev + cur;
    }) / widths.length, 10);
  }

  get ySubscriptXSize() {
    return parseInt(!_.isUndefined(this.int_ySubscriptXSize) ? this.int_ySubscriptXSize : (this.width * 0.6347), 10);
  }
  set ySubscriptXSize(value) {
    this.int_ySubscriptXSize = value;
  }

  get ySubscriptYSize() {
    return parseInt(!_.isUndefined(this.int_ySubscriptYSize) ? this.int_ySubscriptYSize : ((this.ascent - this.descent) * 0.7), 10);
  }
  set ySubscriptYSize(value) {
    this.int_ySubscriptYSize = value;
  }

  get ySubscriptYOffset() {
    return parseInt(!_.isUndefined(this.int_ySubscriptYOffset) ? this.int_ySubscriptYOffset : ((this.ascent - this.descent) * 0.14), 10);
  }
  set ySubscriptYOffset(value) {
    this.int_ySubscriptYOffset = value;
  }

  get ySuperscriptXSize() {
    return parseInt(!_.isUndefined(this.int_ySuperscriptXSize) ? this.int_ySuperscriptXSize : (this.width * 0.6347), 10);
  }
  set ySuperscriptXSize(value) {
    this.int_ySuperscriptXSize = value;
  }

  get ySuperscriptYSize() {
    return parseInt(!_.isUndefined(this.int_ySuperscriptYSize) ? this.int_ySuperscriptYSize : ((this.ascent - this.descent) * 0.7), 10);
  }
  set ySuperscriptYSize(value) {
    this.int_ySuperscriptYSize = value;
  }

  get ySuperscriptYOffset() {
    return parseInt(!_.isUndefined(this.int_ySuperscriptYOffset) ? this.int_ySuperscriptYOffset : ((this.ascent - this.descent) * 0.48), 10);
  }
  set ySuperscriptYOffset(value) {
    this.int_ySuperscriptYOffset = value;
  }

  get yStrikeoutSize() {
    return parseInt(!_.isUndefined(this.int_yStrikeoutSize) ? this.int_yStrikeoutSize : ((this.ascent - this.descent) * 0.049), 10);
  }
  set yStrikeoutSize(value) {
    this.int_yStrikeoutSize = value;
  }

  get yStrikeoutPosition() {
    return parseInt(!_.isUndefined(this.int_yStrikeoutPosition) ? this.int_yStrikeoutPosition : ((this.ascent - this.descent) * 0.258), 10);
  }
  set yStrikeoutPosition(value) {
    this.int_yStrikeoutPosition = value;
  }

  get minLsb() {
    return parseInt(_.min(_.map(this.glyphs, 'xMin')), 10);
  }

  get minRsb() {
    if (!this.glyphs.length) return parseInt(this.width, 10);

    return parseInt(_.reduce(this.glyphs, function (minRsb, glyph) {
      return Math.min(minRsb, glyph.width - glyph.xMax);
    }, 0), 10);
  }

  get xMin() {
    if (!this.glyphs.length) return this.width;

    return _.reduce(this.glyphs, function (xMin, glyph) {
      return Math.min(xMin, glyph.xMin);
    }, 0);
  }

  get yMin() {
    if (!this.glyphs.length) return this.width;

    return _.reduce(this.glyphs, function (yMin, glyph) {
      return Math.min(yMin, glyph.yMin);
    }, 0);
  }

  get xMax() {
    if (!this.glyphs.length) return this.width;

    return _.reduce(this.glyphs, function (xMax, glyph) {
      return Math.max(xMax, glyph.xMax);
    }, 0);
  }

  get yMax() {
    if (!this.glyphs.length) return this.width;

    return _.reduce(this.glyphs, function (yMax, glyph) {
      return Math.max(yMax, glyph.yMax);
    }, 0);
  }

  get avgWidth() {
    var len = this.glyphs.length;

    if (len === 0) {
      return this.width;
    }

    var sumWidth = _.reduce(this.glyphs, function (sumWidth, glyph) {
      return sumWidth + glyph.width;
    }, 0);

    return Math.round(sumWidth / len);
  }

  get maxWidth() {
    if (!this.glyphs.length) return this.width;

    return _.reduce(this.glyphs, function (maxWidth, glyph) {
      return Math.max(maxWidth, glyph.width);
    }, 0);
  }

  get maxExtent() {
    if (!this.glyphs.length) return this.width;

    return _.reduce(this.glyphs, function (maxExtent, glyph) {
      return Math.max(maxExtent, glyph.xMax /*- glyph.xMin*/);
    }, 0);
  }

  // Property used for `sTypoLineGap` in OS/2 and not used for `lineGap` in HHEA, because
  // non zero lineGap causes bad offset in IE, https://github.com/fontello/svg2ttf/issues/37
  get lineGap() {
    return parseInt(!_.isUndefined(this.int_lineGap) ? this.int_lineGap : ((this.ascent - this.descent) * 0.09), 10);
  }
  set lineGap(value) {
    this.int_lineGap = value;
  }

  get underlinePosition() {
    return parseInt(!_.isUndefined(this.int_underlinePosition) ? this.int_underlinePosition : ((this.ascent - this.descent) * 0.01), 10);
  }
  set underlinePosition(value) {
    this.int_underlinePosition = value;
  }
}


class Glyph {
  constructor() {
    this.contours = [];
    this.d = '';
    this.id = '';
    this.codes = []; // needed for nice validator error output
    this.height = 0;
    this.name = '';
    this.width = 0;
  }

  get xMin() {
    var xMin = 0;
    var hasPoints = false;

    _.forEach(this.contours, function (contour) {
      _.forEach(contour.points, function (point) {
        xMin = Math.min(xMin, Math.floor(point.x));
        hasPoints = true;
      });

    });

    if (xMin < -32768) {
      throw new Error('xMin value for glyph ' + (this.name ? ('"' + this.name + '"') : JSON.stringify(this.codes)) +
                      ' is out of bounds (actual ' + xMin + ', expected -32768..32767, d="' + this.d + '")');
    }
    return hasPoints ? xMin : 0;
  }

  get xMax() {
    var xMax = 0;
    var hasPoints = false;

    _.forEach(this.contours, function (contour) {
      _.forEach(contour.points, function (point) {
        xMax = Math.max(xMax, -Math.floor(-point.x));
        hasPoints = true;
      });

    });

    if (xMax > 32767) {
      throw new Error('xMax value for glyph ' + (this.name ? ('"' + this.name + '"') : JSON.stringify(this.codes)) +
                      ' is out of bounds (actual ' + xMax + ', expected -32768..32767, d="' + this.d + '")');
    }
    return hasPoints ? xMax : this.width;
  }

  get yMin() {
    var yMin = 0;
    var hasPoints = false;

    _.forEach(this.contours, function (contour) {
      _.forEach(contour.points, function (point) {
        yMin = Math.min(yMin, Math.floor(point.y));
        hasPoints = true;
      });

    });

    if (yMin < -32768) {
      throw new Error('yMin value for glyph ' + (this.name ? ('"' + this.name + '"') : JSON.stringify(this.codes)) +
                      ' is out of bounds (actual ' + yMin + ', expected -32768..32767, d="' + this.d + '")');
    }
    return hasPoints ? yMin : 0;
  }

  get yMax() {
    var yMax = 0;
    var hasPoints = false;

    _.forEach(this.contours, function (contour) {
      _.forEach(contour.points, function (point) {
        yMax = Math.max(yMax, -Math.floor(-point.y));
        hasPoints = true;
      });

    });

    if (yMax > 32767) {
      throw new Error('yMax value for glyph ' + (this.name ? ('"' + this.name + '"') : JSON.stringify(this.codes)) +
                      ' is out of bounds (actual ' + yMax + ', expected -32768..32767, d="' + this.d + '")');
    }
    return hasPoints ? yMax : 0;
  }
}

class Contour {
  constructor() {
    this.points = [];
  }
}

class Point {
  constructor() {
    this.onCurve = true;
    this.x = 0;
    this.y = 0;
  }
}

class SfntName {
  constructor() {
    this.id = 0;
    this.value = '';
  }
}

export {Font};
export {Glyph};
export {Contour};
export {Point};
export {SfntName};
export {toTTF};
