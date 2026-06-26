
/* IMPORT */

import Buffer, {writeU16} from '../objects/buffer';
import type {Font, Options} from '../types';

/* MAIN */

//URL: http://www.microsoft.com/typography/otspec/name.htm

const createNameTable = ( font: Font, options: Options ): Buffer => {

  const buffer = new Buffer ( 6 );

  writeU16 ( buffer, 0 ); // formatSelector
  writeU16 ( buffer, 0 ); // nameRecordsCount
  writeU16 ( buffer, 6 ); // offset

  return buffer;

};

/* EXPORT */

export default createNameTable;
