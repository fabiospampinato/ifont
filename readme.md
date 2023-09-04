# iFont

An isomorphic icon font generator with support for ligatures.

It generates a single TTF file from a list of SVG icons and their names, mapping each name to a ligature.

It works in the browser too.

## Install

```sh
npm install --save ifont
```

## Usage

You would use the CLI commands like this:

```sh
# Build an icon font from some SVG icons
ifont build -i resources/icons/*.svg -o dist/IconFont.ttf

# Preview an icon font from some SVG icons
ifont preview -i resources/icons/*.svg

# List icons by bytes needed once added to the TTF font
ifont stats -i resources/icons/*.svg
```

You would use the programmatic API like this:

```ts
import ifont from 'ifont';
import fs from 'node:fs';

// Generate a TTF font, as a Uint8Array, from some SVG icons

const ttf = ifont ({
  icons: [
    { name: 'circle', content: '<svg>...</svg>' }
    { name: 'square', content: '<svg>...</svg>' },
    { name: 'triangle', content: '<svg>...</svg>' }
  ]
});

fs.writeFileSync ( 'IconFont.ttf', ttf );
```

## License

- `svg2ttf`: MIT © Vitaly Puzrin
- Rest: MIT © Fabio Spampinato
