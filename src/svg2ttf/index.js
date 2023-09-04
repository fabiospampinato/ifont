/*
 * Copyright: Vitaly Puzrin
 * Author: Sergey Batishchev <snb2003@rambler.ru>
 *
 * Written for fontello.com project.
 */

'use strict';

import SvgPath from 'svgpath';
import * as _ from './lib/lodash.js';
import ucs2 from './lib/ucs2.js';
import * as svg from './lib/svg.js';
import * as sfnt from './lib/sfnt.js';
import {memoize} from '../utils';

var VERSION_RE = /^(Version )?(\d+[.]\d+)$/i;

const path2contours = memoize((path, accuracy) => {
  //SVG transformations
  var svgPath = new SvgPath(path)
    .abs()
    .unshort()
    .unarc()
    .iterate(function (segment, index, x, y) {
      return svg.cubicToQuad(segment, index, x, y, accuracy);
    });
  var sfntContours = svg.toSfntCoutours(svgPath);
  return sfntContours;
});

function svg2ttf(svgString, options) {
  var font = new sfnt.Font();
  var svgFont = svg.load(svgString);

  options = options || {};

  font.id = options.id || svgFont.id;
  font.familyName = options.familyname || svgFont.familyName || svgFont.id;
  font.copyright = options.copyright || svgFont.metadata;
  font.description = options.description || 'Generated by svg2ttf from Fontello project.';
  font.url = options.url || 'http://fontello.com';
  font.sfntNames.push({ id: 2, value: options.subfamilyname || svgFont.subfamilyName || 'Regular' }); // subfamily name
  font.sfntNames.push({ id: 4, value: options.fullname || svgFont.id }); // full name

  var versionString = options.version || 'Version 1.0';

  if (typeof versionString !== 'string') {
    throw new Error('svg2ttf: version option should be a string');
  }
  if (!VERSION_RE.test(versionString)) {
    throw new Error('svg2ttf: invalid option, version - "' + options.version + '"');
  }

  versionString = 'Version ' + versionString.match(VERSION_RE)[2];
  font.sfntNames.push({ id: 5, value: versionString }); // version ID for TTF name table
  font.sfntNames.push({ id: 6, value: (options.fullname || svgFont.id).replace(/[\s\(\)\[\]<>%\/]/g, '').substr(0, 62) }); // Postscript name for the font, required for OSX Font Book

  if (typeof options.ts !== 'undefined') {
    font.createdDate = font.modifiedDate = new Date(parseInt(options.ts, 10) * 1000);
  }

  // Try to fill font metrics or guess defaults
  //
  font.unitsPerEm   = svgFont.unitsPerEm || 1000;
  font.horizOriginX = svgFont.horizOriginX || 0;
  font.horizOriginY = svgFont.horizOriginY || 0;
  font.vertOriginX  = svgFont.vertOriginX || 0;
  font.vertOriginY  = svgFont.vertOriginY || 0;
  font.width        = svgFont.width || svgFont.unitsPerEm;
  font.height       = svgFont.height || svgFont.unitsPerEm;
  font.descent      = !isNaN(svgFont.descent) ? svgFont.descent : -font.vertOriginY;
  font.ascent       = svgFont.ascent || (font.unitsPerEm - font.vertOriginY);
  // Values for font substitution. We're mostly working with icon fonts, so they aren't expected to be substituted.
  // https://docs.microsoft.com/en-us/typography/opentype/spec/os2#sxheight
  font.capHeight    = svgFont.capHeight || 0; // 0 is a valid value if "H" glyph doesn't exist
  font.xHeight      = svgFont.xHeight || 0;   // 0 is a valid value if "x" glyph doesn't exist

  if (typeof svgFont.weightClass !== 'undefined') {
    var wght = parseInt(svgFont.weightClass, 10);

    if (!isNaN(wght)) font.weightClass = wght;
    else {
      // Unknown names are silently ignored
      if (svgFont.weightClass === 'normal') font.weightClass = 400;
      if (svgFont.weightClass === 'bold') font.weightClass = 700;
    }
  }


  if (typeof svgFont.underlinePosition !== 'undefined') {
    font.underlinePosition = svgFont.underlinePosition;
  }
  if (typeof svgFont.underlineThickness !== 'undefined') {
    font.underlineThickness = svgFont.underlineThickness;
  }

  var glyphs = font.glyphs;
  var codePoints = font.codePoints;
  var ligatures = font.ligatures;

  function addCodePoint(codePoint, glyph) {
    if (codePoints[codePoint]) {
      // Ignore code points already defined
      return false;
    }
    codePoints[codePoint] = glyph;
    return true;
  }

  // add SVG glyphs to SFNT font
  _.forEach(svgFont.glyphs, function (svgGlyph) {
    var glyph = new sfnt.Glyph();

    glyph.name = svgGlyph.name;
    glyph.codes = svgGlyph.ligatureCodes || svgGlyph.unicode; // needed for nice validator error output
    glyph.d = svgGlyph.d;
    glyph.height = !isNaN(svgGlyph.height) ? svgGlyph.height : font.height;
    glyph.width = !isNaN(svgGlyph.width) ? svgGlyph.width : font.width;
    glyphs.push(glyph);

    svgGlyph.sfntGlyph = glyph;

    _.forEach(svgGlyph.unicode, function (codePoint) {
      addCodePoint(codePoint, glyph);
    });
  });

  var missingGlyph;

  // add missing glyph to SFNT font
  // also, check missing glyph existance and single instance
  if (svgFont.missingGlyph) {
    missingGlyph = new sfnt.Glyph();
    missingGlyph.d = svgFont.missingGlyph.d;
    missingGlyph.height = !isNaN(svgFont.missingGlyph.height) ? svgFont.missingGlyph.height : font.height;
    missingGlyph.width = !isNaN(svgFont.missingGlyph.width) ? svgFont.missingGlyph.width : font.width;
  } else {
    missingGlyph = _.find(glyphs, function (glyph) {
      return glyph.name === '.notdef';
    });
  }
  if (!missingGlyph) { // no missing glyph and .notdef glyph, we need to create missing glyph
    missingGlyph = new sfnt.Glyph();
  }

  // Create glyphs for all characters used in ligatures
  _.forEach(svgFont.ligatures, function (svgLigature) {
    var ligature = {
      ligature: svgLigature.ligature,
      unicode: svgLigature.unicode,
      glyph: svgLigature.glyph.sfntGlyph
    };

    _.forEach(ligature.unicode, function (charPoint) {
      // We need to have a distinct glyph for each code point so we can reference it in GSUB
      var glyph = new sfnt.Glyph();
      var added = addCodePoint(charPoint, glyph);

      if (added) {
        glyph.name = ucs2.encode([ charPoint ]);
        glyphs.push(glyph);
      }
    });
    ligatures.push(ligature);
  });

  // Missing Glyph needs to have index 0
  if (glyphs.indexOf(missingGlyph) !== -1) {
    glyphs.splice(glyphs.indexOf(missingGlyph), 1);
  }
  glyphs.unshift(missingGlyph);

  var nextID = 0;

  //add IDs
  _.forEach(glyphs, function (glyph) {
    glyph.id = nextID;
    nextID++;
  });

  _.forEach(glyphs, function (glyph) {

    // Calculate accuracy for cubicToQuad transformation
    // For glyphs with height and width smaller than 500 use relative 0.06% accuracy,
    // for larger glyphs use fixed accuracy 0.3.
    var glyphSize = Math.max(glyph.width, glyph.height);
    var accuracy = (glyphSize > 500) ? 0.3 : glyphSize * 0.0006;

    // //SVG transformations
    // var svgPath = new SvgPath(glyph.d)
    //   .abs()
    //   .unshort()
    //   .unarc()
    //   .iterate(function (segment, index, x, y) {
    //     return svg.cubicToQuad(segment, index, x, y, accuracy);
    //   });
    // var sfntContours = svg.toSfntCoutours(svgPath);
    var sfntContours = path2contours(glyph.d, accuracy);

    // Add contours to SFNT font
    glyph.contours = _.map(sfntContours, function (sfntContour) {
      var contour = new sfnt.Contour();

      contour.points = _.map(sfntContour, function (sfntPoint) {
        var point = new sfnt.Point();

        point.x = sfntPoint.x;
        point.y = sfntPoint.y;
        point.onCurve = sfntPoint.onCurve;
        return point;
      });

      return contour;
    });
  });

  var ttf = sfnt.toTTF(font);

  return ttf;
}

export default svg2ttf;
