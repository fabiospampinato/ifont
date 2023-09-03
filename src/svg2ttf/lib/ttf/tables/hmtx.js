'use strict';

// See documentation here: http://www.microsoft.com/typography/otspec/hmtx.htm

import * as _ from '../../lodash.js';
import ByteBuffer from 'microbuffer';

function createHtmxTable(font) {

  var buf = new ByteBuffer(font.glyphs.length * 4);

  _.forEach(font.glyphs, function (glyph) {
    buf.writeUint16(glyph.width); //advanceWidth
    buf.writeInt16(glyph.xMin); //lsb
  });
  return buf;
}

export default createHtmxTable;
