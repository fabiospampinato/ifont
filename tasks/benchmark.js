
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
  name: 'rest',
  iterations: 100,
  fn: () => {
    ifont ({ icons: ICONS });
  }
});
