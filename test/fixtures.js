
/* IMPORT */

import fs from 'node:fs';
import path from 'node:path';
import {name2names} from '../dist/converters.js';

/* MAIN */

const ICONS = fs.readdirSync ( 'test/icons_supported' ).filter ( dirent => (
  dirent.endsWith ( '.svg' )
)).map ( dirent => ({
  name: name2names ( path.basename ( dirent, path.extname ( dirent ) ) ),
  svg: fs.readFileSync ( `test/icons_supported/${dirent}`, 'utf8' )
}));

/* EXPORT */

export {ICONS};
