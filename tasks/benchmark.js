
/* IMPORT */

import benchmark from 'benchloop';
import ifont from '../dist/index.js';
import {ICONS} from '../test/fixtures.js';

/* MAIN */

benchmark ({
  name: 'fresh',
  iterations: 1,
  fn: () => {
    ifont ({ icons: ICONS });
  }
});

benchmark ({
  name: 'incremental',
  iterations: 1_000,
  fn: () => {
    for ( let i = 1; i <= ICONS.length; i++ ) {
      ifont ({ icons: ICONS.slice ( 0, i ) });
    }
  }
});
