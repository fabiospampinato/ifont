
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
  icons: Icon[]
};

type PathSegment = (
  ['M', number, number] |
  ['m', number, number] |
  ['L', number, number] |
  ['l', number, number] |
  ['H', number] |
  ['h', number] |
  ['V', number] |
  ['v', number] |
  ['C', number, number, number, number, number, number] |
  ['c', number, number, number, number, number, number] |
  ['S', number, number, number, number] |
  ['s', number, number, number, number] |
  ['Q', number, number, number, number] |
  ['q', number, number, number, number] |
  ['T', number, number] |
  ['t', number, number] |
  ['A', number, number, number, number, number, number, number] |
  ['a', number, number, number, number, number, number, number] |
  ['Z']
);

type Stat = {
  name: string,
  size: number
};

/* EXPORT */

export type {Glyph, Icon, Options, PathSegment, Stat};
