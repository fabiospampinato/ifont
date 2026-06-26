
/* MAIN */

class Buffer extends Uint8Array {

  offset: number;
  view: DataView;

  constructor ( length: number ) {

    super ( length );

    this.offset = 0;
    this.view = new DataView ( this.buffer );

  }

}

/* UTILITIES - READ */

const readU8 = ( buffer: Buffer, position: number ): number => {
  return buffer.view.getUint8 ( position );
};

const readU16 = ( buffer: Buffer, position: number ): number => {
  return buffer.view.getUint16 ( position );
};

const readU32 = ( buffer: Buffer, position: number ): number => {
  return buffer.view.getUint32 ( position );
};

/* UTILITIES - WRITE */

const writeU8 = ( buffer: Buffer, value: number ): void => {
  buffer.view.setUint8 ( buffer.offset, value );
  buffer.offset += 1;
};

const writeI8 = ( buffer: Buffer, value: number ): void => {
  buffer.view.setInt8 ( buffer.offset, value );
  buffer.offset += 1;
};

const writeU16 = ( buffer: Buffer, value: number ): void => {
  buffer.view.setUint16 ( buffer.offset, value );
  buffer.offset += 2;
};

const writeI16 = ( buffer: Buffer, value: number ): void => {
  buffer.view.setInt16 ( buffer.offset, value );
  buffer.offset += 2;
};

const writeU32 = ( buffer: Buffer, value: number ): void => {
  buffer.view.setUint32 ( buffer.offset, value );
  buffer.offset += 4;
};

const writeI32 = ( buffer: Buffer, value: number ): void => {
  buffer.view.setInt32 ( buffer.offset, value );
  buffer.offset += 4;
};

const writeU64 = ( buffer: Buffer, value: number ): void => {
  writeU32 ( buffer, Math.floor ( value / 4294967296 ) );
  writeU32 ( buffer, value >>> 0 );
};

const writeI64 = ( buffer: Buffer, value: number ): void => {
  writeI32 ( buffer, Math.floor ( value / 4294967296 ) );
  writeI32 ( buffer, value >>> 0 );
};

const writeBytes = ( buffer: Buffer, data: Uint8Array ): void => {
  buffer.set ( data, buffer.offset );
  buffer.offset += data.length;
};

/* EXPORT */

export default Buffer;
export {readU8, readU16, readU32};
export {writeU8, writeI8, writeU16, writeI16, writeU32, writeI32, writeU64, writeI64, writeBytes};
