
/* IMPORT */

import fs from 'node:fs';
import path from 'node:path';

/* MAIN */

const ICONS = fs.readdirSync ( 'test/icons' ).map ( dirent => ({
  content: fs.readFileSync ( `test/icons/${dirent}`, 'utf8' ),
  name: path.basename ( dirent, path.extname ( dirent ) )
}));

/* EXPORT */

export {ICONS};
