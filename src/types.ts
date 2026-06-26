
/* MAIN */

type Icon = {
  name: string,
  svg: string
};

type Options = {
  icons: Icon[],
  size?: number
};

type Stat = {
  name: string,
  size: number
};

/* EXPORT */

export type {Icon, Options, Stat};
