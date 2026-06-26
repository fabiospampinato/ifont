
/* IMPORT */

import Buffer, {writeU16, writeU32, writeBytes} from '../objects/buffer';
import {chars2number, sumBy} from '../utils';
import type {Dict, Font, Ligature, LigatureGroup, Options} from '../types';

/* HELPERS */

const MAX_LIGSUBST_SIZE = 60_000;
const EXT_SUBST_SIZE = 8;

const createScriptTable = (): Buffer => {

  const buffer = new Buffer ( 12 );

  writeU16 ( buffer, 4 ); // defaultLangSys
  writeU16 ( buffer, 0 ); // langSysCount

  writeU16 ( buffer, 0 ); // lookupOrder
  writeU16 ( buffer, 0 ); // reqFeatureIndex
  writeU16 ( buffer, 1 ); // featureCount
  writeU16 ( buffer, 0 ); // featureIndex[0]

  return buffer;

};

const createScriptListTable = (): Buffer => {

  const script = createScriptTable ();
  const headerSize = 2 + 2 * 6;
  const buffer = new Buffer ( headerSize + ( 2 * script.length ) );

  writeU16 ( buffer, 2 ); // scriptCount

  writeU32 ( buffer, chars2number ( 'DFLT' ) ); // scriptTag
  writeU16 ( buffer, headerSize ); // scriptOffset

  writeU32 ( buffer, chars2number ( 'latn' ) ); // scriptTag
  writeU16 ( buffer, headerSize ); // scriptOffset

  writeBytes ( buffer, script );

  return buffer;

};

const createFeatureListTable = (): Buffer => {

  const buffer = new Buffer ( 14 );

  writeU16 ( buffer, 1 ); // featureCount
  writeU32 ( buffer, chars2number ( 'liga' ) ); // featureTag
  writeU16 ( buffer, 8 ); // featureOffset

  writeU16 ( buffer, 0 ); // featureParams
  writeU16 ( buffer, 1 ); // lookupCount
  writeU16 ( buffer, 0 ); // lookupListIndex

  return buffer;

};

const getLigatureTableSize = ( ligature: Ligature ): number => {

  return 4 + ( 2 * ( ligature.unicode.length - 1 ) );

};

const createLigatureTable = ( font: Font, ligature: Ligature ): Buffer => {

  const bufferLength = getLigatureTableSize ( ligature );
  const buffer = new Buffer ( bufferLength );

  writeU16 ( buffer, ligature.glyph.id ); // ligGlyph
  writeU16 ( buffer, ligature.unicode.length ); // compCount

  for ( let i = 1; i < ligature.unicode.length; i++ ) {

    writeU16 ( buffer, font.glyphByCodePoint[ligature.unicode[i]]?.id ?? 0 ); // componentGlyphID

  }

  return buffer;

};

const getLigatureSetSize = ( ligatures: Ligature[] ): number => {

  return 2 + ( 2 * ligatures.length ) + sumBy ( ligatures, getLigatureTableSize );

};

const createLigatureSetTable = ( font: Font, ligatures: Ligature[] ): Buffer => {

  const tables = ligatures.map ( ligature => createLigatureTable ( font, ligature ) );
  const headerSize = 2 + ( 2 * tables.length );
  const bufferLength = headerSize + sumBy ( tables, table => table.length );
  const buffer = new Buffer ( bufferLength );

  writeU16 ( buffer, tables.length ); // ligatureCount

  let offset = headerSize;

  for ( const table of tables ) {

    writeU16 ( buffer, offset ); // ligatureOffset

    offset += table.length;

  }

  for ( const table of tables ) {

    writeBytes ( buffer, table ); // ligature table

  }

  return buffer;

};

const createCoverageTable = ( groups: LigatureGroup[] ): Buffer => {

  const bufferLength = 4 + ( 2 * groups.length );
  const buffer = new Buffer ( bufferLength );

  writeU16 ( buffer, 1 ); // coverageFormat
  writeU16 ( buffer, groups.length ); // glyphCount

  for ( const group of groups ) {

    writeU16 ( buffer, group.startGlyph.id ); // glyphID

  }

  return buffer;

};

const batchLigatureGroups = ( groups: LigatureGroup[] ): LigatureGroup[][] => {

  let batches: LigatureGroup[][] = [];
  let batch: LigatureGroup[] = [];
  let size = 10;

  for ( const group of groups ) {

    const groupSize = 4 + getLigatureSetSize ( group.ligatures );

    if ( batch.length && size + groupSize > MAX_LIGSUBST_SIZE ) {

      batches.push ( batch );
      batch = [];
      size = 10;

    }

    batch.push ( group );
    size += groupSize;

  }

  if ( batch.length ) {

    batches.push ( batch );

  }

  return batches;

};

const createLigSubstTable = ( font: Font, groups: LigatureGroup[] ): Buffer => {

  const sets = groups.map ( group => createLigatureSetTable ( font, group.ligatures ) );
  const headerSize = 6 + 2 * sets.length;
  const coverage = createCoverageTable ( groups );
  const coverageOffset = headerSize + sumBy ( sets, set => set.length );
  const buffer = new Buffer ( coverageOffset + coverage.length );

  writeU16 ( buffer, 1 ); // substFormat
  writeU16 ( buffer, coverageOffset ); // coverageOffset
  writeU16 ( buffer, sets.length ); // ligSetCount

  let offset = headerSize;

  for ( const set of sets ) {

    writeU16 ( buffer, offset ); // ligatureSetOffset

    offset += set.length;

  }

  for ( const set of sets ) {

    writeBytes ( buffer, set ); // ligature set table

  }

  writeBytes ( buffer, coverage ); // coverage table

  return buffer;

};

const createLigatureLookupTable = ( font: Font, groups: LigatureGroup[] ): Buffer => {

  const subtables = batchLigatureGroups ( groups ).map ( batch => createLigSubstTable ( font, batch ) );
  const headerSize = 6 + ( 2 * subtables.length );
  const bufferLength = headerSize + sumBy ( subtables, table => EXT_SUBST_SIZE + table.length );
  const buffer = new Buffer ( bufferLength );

  writeU16 ( buffer, 7 ); // lookupType, extension substitution
  writeU16 ( buffer, 0 ); // lookupFlag
  writeU16 ( buffer, subtables.length ); // subTableCount

  let offset = headerSize;

  for ( const subtable of subtables ) {

    writeU16 ( buffer, offset ); // subTableOffset

    offset += EXT_SUBST_SIZE + subtable.length;

  }

  for ( const subtable of subtables ) {

    writeU16 ( buffer, 1 ); // substFormat
    writeU16 ( buffer, 4 ); // coverageOffset
    writeU32 ( buffer, EXT_SUBST_SIZE ); // ligatureSetCount
    writeBytes ( buffer, subtable ); // ligature set table

  }

  return buffer;

};

const createLookupListTable = ( font: Font ): Buffer => {

  const groupedLigatures: Dict<number, Ligature[]> = {};

  for ( const ligature of font.ligatures ) {

    const codePoint = ligature.unicode[0];
    const ligatures = groupedLigatures[codePoint] ??= [];

    ligatures.push ( ligature );

  }

  const groups: LigatureGroup[] = [];

  for ( const codePointStr in groupedLigatures ) {

    const codePoint = parseInt ( codePointStr, 10 );
    const ligatures = groupedLigatures[codePoint];
    const startGlyph = font.glyphByCodePoint[codePoint];

    if ( !ligatures || !startGlyph ) continue;

    ligatures.sort ( ( a, b ) => b.unicode.length - a.unicode.length );

    const group: LigatureGroup = { ligatures, startGlyph };

    groups.push ( group );

  };

  groups.sort ( ( a, b ) => a.startGlyph.id - b.startGlyph.id );

  const lookup = createLigatureLookupTable ( font, groups );
  const buffer = new Buffer ( 4 + lookup.length );

  writeU16 ( buffer, 1 ); // lookupCount
  writeU16 ( buffer, 4 ); // lookupOffset
  writeBytes ( buffer, lookup ); // lookupList

  return buffer;

};

/* MAIN */

//URL: http://www.microsoft.com/typography/otspec/gsub.htm

const createGsubTable = ( font: Font, options: Options ): Buffer => {

  const scriptListTable = createScriptListTable ();
  const featureListTable = createFeatureListTable ();
  const lookupListTable = createLookupListTable ( font );

  const scriptListOffset = 10;
  const featureListOffset = scriptListOffset + scriptListTable.length;
  const lookupListOffset = featureListOffset + featureListTable.length;

  const buffer = new Buffer ( lookupListOffset + lookupListTable.length );

  writeU32 ( buffer, 0x10000 ); // version, v1

  writeU16 ( buffer, scriptListOffset );
  writeU16 ( buffer, featureListOffset );
  writeU16 ( buffer, lookupListOffset );

  writeBytes ( buffer, scriptListTable );
  writeBytes ( buffer, featureListTable );
  writeBytes ( buffer, lookupListTable );

  return buffer;

};

/* EXPORT */

export default createGsubTable;
