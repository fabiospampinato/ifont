
/* IMPORT */

import Buffer, {writeI16, writeU32, writeI32} from '../objects/buffer';
import type {Font, Options} from '../types';

/* MAIN */

//URL: http://www.microsoft.com/typography/otspec/post.htm

const createPostTable = ( font: Font, options: Options ): Buffer => {

  const buffer = new Buffer ( 32 );

  writeI32 ( buffer, 0x30000 ); // version, v3.0
  writeI32 ( buffer, 0 ); // italicAngle
  writeI16 ( buffer, 0 ); // underlinePosition
  writeI16 ( buffer, 0 ); // underlineThickness
  writeU32 ( buffer, 1 ); // isFixedPitch
  writeU32 ( buffer, 0 ); // minMemType42
  writeU32 ( buffer, 0 ); // maxMemType42
  writeU32 ( buffer, 0 ); // minMemType1
  writeU32 ( buffer, 0 ); // maxMemType1

  return buffer;

};

/* EXPORT */

export default createPostTable;
