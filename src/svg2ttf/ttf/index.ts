
/* IMPORT */

import Buffer, {readU32, writeU16, writeU32, writeBytes} from '../objects/buffer';
import {chars2number, floor, log, pow, sumBy} from '../utils';
import type {Font, Options} from '../types';

import createCmapTable from './cmap';
import createGlyfTable from './glyf';
import createGsubTable from './gsub';
import createHeadTable from './head';
import createHheaTable from './hhea';
import createHmtxTable from './hmtx';
import createLocaTable from './loca';
import createMaxpTable from './maxp';
import createNameTable from './name';
import createOS2Table from './os2';
import createPostTable from './post';

/* HELPERS */

const TABLES_CREATORS = [createHeadTable, createHheaTable, createMaxpTable, createOS2Table, createHmtxTable, createCmapTable, createLocaTable, createGlyfTable, createGsubTable, createNameTable, createPostTable];
const TABLES_NAMES = ['head', 'hhea', 'maxp', 'OS/2', 'hmtx', 'cmap', 'loca', 'glyf', 'GSUB', 'name', 'post'];

const getTableChecksum = ( buffer: Buffer ): number => {

  let sum = 0;

  const alignedLength = buffer.length & ~3;

  for ( let offset = 0; offset < alignedLength; offset += 4 ) {

    sum = ( sum + readU32 ( buffer, offset ) ) >>> 0;

  }

  const remainder = buffer.length - alignedLength;

  if ( !remainder ) return sum;

  let tail = 0;

  for ( let offset = alignedLength, end = buffer.length; offset < end; offset++ ) {

    tail = ( tail << 8 ) | buffer[offset];

  }

  tail <<= ( 4 - remainder ) * 8;

  return ( sum + tail ) >>> 0;

};

const getTableSizeWithPadding = ( buffer: Buffer ): number => {

  const size = buffer.length;
  const padding = ( 4 - size % 4 ) % 4;
  const sizeWithPadding = size + padding;

  return sizeWithPadding;

};

/* MAIN */

const createTTF = ( font: Font, options: Options ): Buffer => {

  const tables = TABLES_CREATORS.map ( createTable => createTable ( font, options ) );

  const headerLength = 12 + ( 16 * tables.length );
  const tablesLength = sumBy ( tables, table => getTableSizeWithPadding ( table ) );
  const bufferLength = headerLength + tablesLength;
  const buffer = new Buffer ( bufferLength );

  const entrySelector = floor ( log ( tables.length ) / Math.LN2 );
  const searchRange = pow ( 2, entrySelector ) * 16;
  const rangeShift = ( 16 * tables.length ) - searchRange;

  writeU32 ( buffer, 0x10000 ); // version, v1
  writeU16 ( buffer, tables.length ); // numTables
  writeU16 ( buffer, searchRange ); // searchRange
  writeU16 ( buffer, entrySelector ); // entrySelector
  writeU16 ( buffer, rangeShift ); // rangeShift

  for ( let i = 0, offset = headerLength, l = tables.length; i < l; i++ ) {

    const table = tables[i];
    const name = TABLES_NAMES[i];

    writeU32 ( buffer, chars2number ( name ) ); // name
    writeU32 ( buffer, getTableChecksum ( table ) ); // checksum
    writeU32 ( buffer, offset ); // offset
    writeU32 ( buffer, table.length ); // length

    offset += getTableSizeWithPadding ( table );

  }

  for ( const table of tables ) {

    writeBytes ( buffer, table ); // table

    buffer.offset += getTableSizeWithPadding ( table ) - table.length; // Skipping padding

  }

  buffer.offset = headerLength + 8; // Jumping to checksum field in head table

  writeU32 ( buffer, ( 0xB1B0AFBA - getTableChecksum ( buffer ) ) >>> 0 ); // adjustedChecksum

  return buffer;

};

/* EXPORT */

export default createTTF;
