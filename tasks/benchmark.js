
/* IMPORT */

import benchmark from 'benchloop';
import ifont from '../dist/index.js';
import {ICONS} from '../test/fixtures.js';

/* MAIN */

benchmark.config ({
  iterations: 1000
});

benchmark ({
  name: 'build',
  fn: () => {
    ifont ({ icons: ICONS });
  }
});

benchmark.summary ();
