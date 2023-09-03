#!/usr/bin/env node

/* IMPORT */

import {Buffer} from 'node:buffer';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import {bin} from 'specialist';
import open from 'tiny-open';
import zeptoid from 'zeptoid';
import ifont from '.';
import {icons2preview} from './converters';
import type {Icon} from './types';

/* HELPERS */

const paths2icons = ( iconsPaths: string[] ): Icon[] => {
  return iconsPaths.map ( iconPath => ({
    content: fs.readFileSync ( path.join ( process.cwd (), iconPath ), 'utf8' ),
    name: path.basename ( iconPath, '.svg' )
  }));
};

/* MAIN */

bin ( 'ifont', 'An icon font builder' )
  /* BUILD */
  .command ( 'build', 'Build the icon font from the provided icons' )
  .option ( '--icon, -i <path...>', 'Path to an icon to include in the font', { eager: true } )
  .option ( '--output, -o <path>', 'Path to the destination of the font', { default: 'iFont.ttf' } )
  .action ( ( options ) => {

    const icons = paths2icons ( options['icon'] );
    const font = ifont ({ icons });
    const fontPath = path.join ( process.cwd (), options['output'] );

    fs.writeFileSync ( fontPath, font );

  })
  /* PREVIEW */
  .command ( 'preview', 'Preview the icon font from the provided icons' )
  .option ( '--icon, -i <path...>', 'Path to an icon to include in the font', { eager: true } )
  .action ( options => {

    const icons = paths2icons ( options['icon'] );
    const font = ifont ({ icons });
    const fontB64 = Buffer.from ( font ).toString ( 'base64' );
    const fontB64Inline = `data:font/ttf;base64,${fontB64}`;
    const preview = icons2preview ( icons, fontB64Inline );
    const previewPath = path.join ( os.tmpdir (), `${zeptoid ()}.html` );

    fs.writeFileSync ( previewPath, preview );

    open ( previewPath );

  })
  /* RUN */
  .run ();
