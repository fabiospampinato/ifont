'use strict';

// See documentation here: http://www.microsoft.com/typography/otspec/name.htm

import * as _ from '../../lodash.js';
import ByteBuffer from 'microbuffer';
import Str from '../../str.js';

var TTF_NAMES = {
  COPYRIGHT: 0,
  FONT_FAMILY: 1,
  ID: 3,
  DESCRIPTION: 10,
  URL_VENDOR: 11
};

function tableSize(names) {
  var result = 6; // table header

  _.forEach(names, function (name) {
    result += 12 + name.data.length; //name header and data
  });
  return result;
}

function getStrings(name, id) {
  var result = [];
  var str = new Str(name);

  result.push({ data: str.toUTF8Bytes(), id: id, platformID : 1, encodingID : 0, languageID : 0 }); //mac standard
  result.push({ data: str.toUCS2Bytes(), id: id, platformID : 3, encodingID : 1, languageID : 0x409 }); //windows standard
  return result;
}

// Collect font names
function getNames(font) {
  var result = [];

  if (font.copyright) {
    result.push.apply(result, getStrings(font.copyright, TTF_NAMES.COPYRIGHT));
  }
  if (font.familyName) {
    result.push.apply(result, getStrings(font.familyName, TTF_NAMES.FONT_FAMILY));
  }
  if (font.id) {
    result.push.apply(result, getStrings(font.id, TTF_NAMES.ID));
  }
  result.push.apply(result, getStrings(font.description, TTF_NAMES.DESCRIPTION));
  result.push.apply(result, getStrings(font.url, TTF_NAMES.URL_VENDOR));

  _.forEach(font.sfntNames, function (sfntName) {
    result.push.apply(result, getStrings(sfntName.value, sfntName.id));
  });

  result.sort(function (a, b) {
    var orderFields = [ 'platformID', 'encodingID', 'languageID', 'id' ];
    var i;

    for (i = 0; i < orderFields.length; i++) {
      if (a[orderFields[i]] !== b[orderFields[i]]) {
        return a[orderFields[i]] < b[orderFields[i]] ? -1 : 1;
      }
    }
    return 0;
  });

  return result;
}

function createNameTable(font) {

  var names = getNames(font);

  var buf = new ByteBuffer(tableSize(names));

  buf.writeUint16(0); // formatSelector
  buf.writeUint16(names.length); // nameRecordsCount
  var offsetPosition = buf.tell();

  buf.writeUint16(0); // offset, will be filled later
  var nameOffset = 0;

  _.forEach(names, function (name) {
    buf.writeUint16(name.platformID); // platformID
    buf.writeUint16(name.encodingID); // platEncID
    buf.writeUint16(name.languageID); // languageID, English (USA)
    buf.writeUint16(name.id); // nameID
    buf.writeUint16(name.data.length); // reclength
    buf.writeUint16(nameOffset); // offset
    nameOffset += name.data.length;
  });
  var actualStringDataOffset = buf.tell();

  //Array of bytes with actual string data
  _.forEach(names, function (name) {
    buf.writeBytes(name.data);
  });

  //write actual string data offset
  buf.seek(offsetPosition);
  buf.writeUint16(actualStringDataOffset); // offset

  return buf;
}

export default createNameTable;
