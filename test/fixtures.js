
/* IMPORT */

import fs from 'node:fs';
import path from 'node:path';

/* MAIN */

const ICONS = fs.readdirSync ( 'test/icons_supported' ).filter ( dirent => (
  dirent.endsWith ( '.svg' )
)).map ( dirent => ({
  content: fs.readFileSync ( `test/icons_supported/${dirent}`, 'utf8' ),
  name: path.basename ( dirent, path.extname ( dirent ) )
}));

/* EXPORT */

export {ICONS};
