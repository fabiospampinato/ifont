
/* MAIN */

type Glyph = {
  path: string,
  name: string
};

type Icon = {
  content: string,
  name: string
};

type Options = {
  icons: Icon[],
};

/* EXPORT */

export type {Glyph, Icon, Options};
