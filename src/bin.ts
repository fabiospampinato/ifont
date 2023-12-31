#!/usr/bin/env node

/* IMPORT */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import Base64 from 'radix64-encoding';
import {bin, color} from 'specialist';
import open from 'tiny-open';
import zeptoid from 'zeptoid';
import ifont from '.';
import {icons2preview, icons2stats, unicode2chars} from './converters';
import {castArray} from './utils';
import type {Icon} from './types';

/* HELPERS */

const paths2icons = ( iconsPaths: string[] | string ): Icon[] => {
  return castArray ( iconsPaths ).map ( iconPath => ({
    content: fs.readFileSync ( path.join ( process.cwd (), iconPath ), 'utf8' ),
    name: unicode2chars ( path.basename ( iconPath, '.svg' ) )
  }));
};

/* MAIN */

bin ( 'ifont', 'An icon font builder' )
  /* BUILD */
  .command ( 'build', 'Build the icon font from the provided icons' )
  .option ( '--icon, -i <path...>', 'Path to an icon to include in the font', { default: [], eager: true } )
  .option ( '--output, -o <path>', 'Path to the destination of the font', { default: 'iFont.ttf' } )
  .action ( options => {

    const icons = paths2icons ( options['icon'] );
    const font = ifont ({ icons });
    const fontPath = path.join ( process.cwd (), options['output'] );

    fs.writeFileSync ( fontPath, font );

  })
  /* PREVIEW */
  .command ( 'preview', 'Preview the icon font from the provided icons' )
  .option ( '--icon, -i <path...>', 'Path to an icon to include in the font', { default: [], eager: true } )
  .action ( options => {

    const icons = paths2icons ( options['icon'] );
    const font = ifont ({ icons });
    const fontB64 = Base64.encode ( font );
    const fontB64Inline = `data:font/ttf;base64,${fontB64}`;
    const preview = icons2preview ( icons, fontB64Inline );
    const previewPath = path.join ( os.tmpdir (), `${zeptoid ()}.html` );

    fs.writeFileSync ( previewPath, preview );

    open ( previewPath );

  })
  /* STATS */
  .command ( 'stats', 'Show size statistics about the provided icons' )
  .option ( '--icon, -i <path...>', 'Path to an icon to include in the font', { default: [], eager: true } )
  .action ( options => {

    const icons = paths2icons ( options['icon'] );
    const font = ifont ({ icons });
    const stats = icons2stats ( icons );
    const statsAZ = [...stats].sort ( ( a, b ) => a.size - b.size );

    for ( const stat of statsAZ ) {

      console.log ( `${stat.name}${color.dim ( ':' )} ${color.cyan ( String ( stat.size ) )}` );

    }

    console.log ( color.dim ( '---' ) );
    console.log ( `Total${color.dim ( ':' )} ${color.cyan ( String ( font.byteLength ) )}` );

  })
  /* RUN */
  .run ();
