'use strict';

import * as _ from './lodash.js';
import cubic2quad from 'cubic2quad';
import svgpath from 'svgpath';
import ucs2 from './ucs2.js';

function getGlyph(glyphElem, fontInfo) {
  var glyph = {};

  if (glyphElem.hasAttribute('d')) {
    glyph.d = glyphElem.getAttribute('d').trim();
  } else {
    // try nested <path>
    var pathElem = glyphElem.getElementsByTagName('path')[0];

    if (pathElem.hasAttribute('d')) {
      // <path> has reversed Y axis
      glyph.d = svgpath(pathElem.getAttribute('d'))
        .scale(1, -1)
        .translate(0, fontInfo.ascent)
        .toString();
    } else {
      throw new Error("Can't find 'd' attribute of <glyph> tag.");
    }
  }

  glyph.unicode = [];

  if (glyphElem.getAttribute('unicode')) {
    glyph.character = glyphElem.getAttribute('unicode');
    var unicode = ucs2.decode(glyph.character);

    // If more than one code point is involved, the glyph is a ligature glyph
    if (unicode.length > 1) {
      glyph.ligature = glyph.character;
      glyph.ligatureCodes = unicode;
    } else {
      glyph.unicode.push(unicode[0]);
    }
  }

  glyph.name = glyphElem.getAttribute('glyph-name');

  if (glyphElem.getAttribute('horiz-adv-x')) {
    glyph.width = parseInt(glyphElem.getAttribute('horiz-adv-x'), 10);
  }

  return glyph;
}

function deduplicateGlyps(glyphs, ligatures) {
  // Result (the list of unique glyphs)
  var result = [];

  _.forEach(glyphs, function (glyph) {
    // Search for glyphs with the same properties (width and d)
    var canonical = _.find(result, { width: glyph.width, d: glyph.d });

    if (canonical) {
      // Add the code points to the unicode array.
      // The fields “name” and “character” are not that important so we leave them how we first enounter them and throw the rest away
      canonical.unicode = canonical.unicode.concat(glyph.unicode);
      glyph.canonical = canonical;
    } else {
      result.push(glyph);
    }
  });

  // Update ligatures to point to the canonical version
  _.forEach(ligatures, function (ligature) {
    while (_.has(ligature.glyph, 'canonical')) {
      ligature.glyph = ligature.glyph.canonical;
    }
  });

  return result;
}

function load(icons) {

  var familyName = 'iFont';
  var subfamilyName = 'Regular';
  var id = (familyName + '-' + subfamilyName).replace(/[\s\(\)\[\]<>%\/]/g, '').substr(0, 62);
  var size = 240;

  var font = {
    id: id,
    familyName: familyName,
    subfamilyName: subfamilyName,
    stretch: 'normal',
    width: size,
    // height: size,
    ascent: size,
    descent: 0,
    unitsPerEm: size,
  };

  font.missingGlyph = {};
  font.missingGlyph.d = '';
  font.missingGlyph.width = 0;

  var glyphs = [];
  var ligatures = [];

  icons.forEach ( icon => {
    var glyph = {
      d: icon.path,
      unicode: [],
      character: icon.name,
      ligature: icon.name,
      ligatureCodes: icon.name.split ( '' ).map ( c => c.charCodeAt ( 0 ) ),
      name: '',
      width: size
    }

    glyphs.push(glyph);
    ligatures.push({
      ligature: glyph.ligature,
      unicode: glyph.ligatureCodes,
      glyph: glyph
    });
  });

  glyphs = deduplicateGlyps(glyphs, ligatures);

  font.glyphs = glyphs;
  font.ligatures = ligatures;

  return font;
}

function cubicToQuad(segment, index, x, y, accuracy) {
  if (segment[0] === 'C') {
    var quadCurves = cubic2quad(
      x, y,
      segment[1], segment[2],
      segment[3], segment[4],
      segment[5], segment[6],
      accuracy
    );

    var res = [];

    for (var i = 2; i < quadCurves.length; i += 4) {
      res.push([ 'Q', quadCurves[i], quadCurves[i + 1], quadCurves[i + 2], quadCurves[i + 3] ]);
    }
    return res;
  }
}


// Converts svg points to contours.  All points must be converted
// to relative ones, smooth curves must be converted to generic ones
// before this conversion.
//
function toSfntCoutours(svgPath) {
  var resContours = [];
  var resContour = [];

  svgPath.iterate(function (segment, index, x, y) {

    //start new contour
    if (index === 0 || segment[0] === 'M') {
      resContour = [];
      resContours.push(resContour);
    }

    var name = segment[0];

    if (name === 'Q') {
      //add control point of quad spline, it is not on curve
      resContour.push({ x: segment[1], y: segment[2], onCurve: false });
    }

    // add on-curve point
    if (name === 'H') {
      // vertical line has Y coordinate only, X remains the same
      resContour.push({ x: segment[1], y: y, onCurve: true });
    } else if (name === 'V') {
      // horizontal line has X coordinate only, Y remains the same
      resContour.push({ x: x, y: segment[1], onCurve: true });
    } else if (name !== 'Z') {
      // for all commands (except H and V) X and Y are placed in the end of the segment
      resContour.push({ x: segment[segment.length - 2], y: segment[segment.length - 1], onCurve: true });
    }

  });
  return resContours;
}


export {load};
export {cubicToQuad};
export {toSfntCoutours};
