
/* IMPORT */

import svgPath from 'svgpath';
import XML from 'xml-simple-parser';
import type {Node, NodeElement} from 'xml-simple-parser';

/* HELPERS - UTILS */

const absolutize = ( path: string ): string => {

  if ( !path ) return path;
  if ( !isRelativePath ( path ) ) return path;

  return svgPath ( path ).abs ().toString ();

};

const isRelativePath = ( path: string ): boolean => {

  return /[a-z]/.test ( path );

};

const withTransform = ( path: string, attrs: Record<string, string | true> ): string => {

  const transform = attrs['transform'];

  if ( !transform || transform === true ) return path;

  return svgPath ( path ).transform ( transform ).toString ();

};

/* HELPERS - TRANSFORMS */

const children2path = ( nodes: Node[], size: number, symbols: Record<string, NodeElement> ): string => {

  return nodes.map ( child => node2path ( child, size, symbols ) ).join ( '' );

};

const circle2path = ( node: NodeElement ): string => {

  const attrs = node.attributes;
  const cx = +attrs['cx'];
  const cy = +attrs['cy'];
  const r = +attrs['r'];

  return withTransform (
    `M${cx + r} ${cy} ` +
    `A${r} ${r} 0 0 1 ${cx} ${cy + r} ` +
    `A${r} ${r} 0 0 1 ${cx - r} ${cy} ` +
    `A${r} ${r} 0 0 1 ${cx + r} ${cy}`,
    attrs
  );

};

const ellipse2path = ( node: NodeElement ): string => {

  const attrs = node.attributes;
  const cx = +attrs['cx'];
  const cy = +attrs['cy'];
  const rx = +attrs['rx'];
  const ry = +attrs['ry'];

  return withTransform (
    `M${cx + rx} ${cy} ` +
    `A${rx} ${ry} 0 0 1 ${cx} ${cy + ry} ` +
    `A${rx} ${ry} 0 0 1 ${cx - rx} ${cy} ` +
    `A${rx} ${ry} 0 0 1 ${cx + rx} ${cy}`,
    attrs
  );

};

const g2path = ( node: NodeElement, size: number, symbols: Record<string, NodeElement> ): string => {

  const path = children2path ( node.children, size, symbols );

  return withTransform ( path, node.attributes );

};

const line2path = ( node: NodeElement ): string => {

  const attrs = node.attributes;
  const x1 = +attrs['x1'];
  const y1 = +attrs['y1'];
  const x2 = +attrs['x2'];
  const y2 = +attrs['y2'];

  return withTransform ( `M${x1} ${y1} L${x2} ${y2}`, node.attributes );

};

const path2path = ( node: NodeElement ): string => {

  const path = `${node.attributes['d'] || ''}`;

  return withTransform ( absolutize ( path ), node.attributes );

};

const poly2path = ( node: NodeElement ): string => {

  const points = `${node.attributes['points'] || ''}`;
  const coords = points.replace ( /[\s,]+/g, ' ' ).trim ().split ( ' ' );

  let path = '';

  for ( let i = 0, l = coords.length; i < l; i += 2 ) {

    const x = coords[i];
    const y = coords[i + 1];

    path += `${i === 0 ? 'M' : ' L'}${x} ${y}`;

  }

  return withTransform ( path, node.attributes );

};

const rect2path = ( node: NodeElement ): string => {

  const calc = ( value: string, base: number ): number => {
    if ( value.endsWith ( '%' ) ) {
      return ( +value.slice ( 0, -1 ) / 100 ) * base;
    } else {
      return +value;
    }
  };

  const attrs = node.attributes;
  const w = +attrs['width'];
  const h = +attrs['height'];
  const x = +attrs['x'];
  const y = +attrs['y'];

  let rx: number | string = attrs['rx'] ? `${attrs['rx']}` : 'auto';
  let ry: number | string = attrs['ry'] ? `${attrs['ry']}` : 'auto';
  if ( rx === 'auto' && ry === 'auto' ) {
    rx = ry = 0;
  } else if ( rx !== 'auto' && ry === 'auto' ) {
    rx = ry = calc ( rx, w );
  } else if ( ry !== 'auto' && rx === 'auto' ) {
    ry = rx = calc ( ry, h );
  } else {
    rx = calc ( rx, w );
    ry = calc ( ry, h );
  }
  if ( rx > w / 2 ) {
    rx = w / 2;
  }
  if ( ry > h / 2 ) {
    ry = h / 2;
  }

  const hasRadius = ( rx > 0 && ry > 0 );

  return withTransform (
    `M${x + rx} ${y} ` +
    `H${x + w - rx} ` +
    ( hasRadius ? `A${rx} ${ry} 0 0 1 ${x + w} ${y + ry} ` : '' ) +
    `V${y + h - ry} ` +
    ( hasRadius ? `A${rx} ${ry} 0 0 1 ${x + w - rx} ${y + h} ` : '' ) +
    `H${x + rx} ` +
    ( hasRadius ? `A${rx} ${ry} 0 0 1 ${x} ${y + h - ry} ` : '' ) +
    `V${y + ry} ` +
    ( hasRadius ? `A${rx} ${ry} 0 0 1 ${x + rx} ${y}` : '' ),
    node.attributes
  );

};

const svg2path = ( node: NodeElement, size: number, symbols: Record<string, NodeElement> ): string => {

  const attrs = node.attributes;
  const viewBox = `${attrs['viewBox'] || ''}`;
  const widthFallback = +attrs['width'] || 1;
  const heightFallback = +attrs['height'] || 1;
  const [x = 0, y = 0, w = widthFallback, h = heightFallback] = viewBox.trim ().split ( /\s+/ ).map ( Number );

  const path = children2path ( node.children, size, symbols );

  if ( !path ) return '';

  if ( h >= w ) {

    const scaleX = ( size / w ) * ( w / h );
    const scaleY = - ( size / h );
    const width = Math.abs ( w * scaleX );
    const translateX = ( - ( x * scaleX ) ) + ( ( size - width ) / 2 );
    const translateY = ( size - ( y * scaleY ) );

    return svgPath ( path ).scale ( scaleX, scaleY ).translate ( translateX, translateY ).toString ();

  } else {

    const scaleX = ( size / w );
    const scaleY = - ( size / h ) * ( h / w );
    const height = Math.abs ( h * scaleY );
    const translateX = - ( x * scaleX );
    const translateY = ( size - ( y * scaleY ) ) - ( ( size - height ) / 2 );

    return svgPath ( path ).scale ( scaleX, scaleY ).translate ( translateX, translateY ).toString ();

  }

};

const symbol2path = ( symbol: NodeElement, use: NodeElement, size: number, symbols: Record<string, NodeElement> ): string => {

  const symbolAttrs = symbol.attributes;
  const viewBox = `${symbolAttrs['viewBox'] || ''}`;
  const widthFallback = +symbolAttrs['width'] || 1;
  const heightFallback = +symbolAttrs['height'] || 1;
  const [vx = 0, vy = 0, vw = widthFallback, vh = heightFallback] = viewBox.trim ().split ( /\s+/ ).map ( Number );

  const useAttrs = use.attributes;
  const w = +useAttrs['width'] || vw;
  const h = +useAttrs['height'] || vh;
  const x = +useAttrs['x'] || 0;
  const y = +useAttrs['y'] || 0;

  const path = children2path ( symbol.children, size, symbols );

  if ( !path ) return '';

  const scale = Math.min ( w / vw, h / vh );
  const scaledW = vw * scale;
  const scaledH = vh * scale;
  const offsetX = x + ( w - scaledW ) / 2;
  const offsetY = y + ( h - scaledH ) / 2;
  const translateX = offsetX - ( vx * scale );
  const translateY = offsetY - ( vy * scale );
  const transform = `${useAttrs['transform'] || ''}`;

  if ( transform ) {

    return svgPath ( path ).scale ( scale, scale ).translate ( translateX, translateY ).transform ( transform ).toString ();

  } else {

    return svgPath ( path ).scale ( scale, scale ).translate ( translateX, translateY ).toString ();

  }

};

const use2path = ( node: NodeElement, size: number, symbols: Record<string, NodeElement> ): string => {

  const href = `${node.attributes['href'] || node.attributes['xlink:href'] || ''}`;
  const id = href.replace ( /^#/, '' );
  const symbol = symbols[id];

  if ( !symbol ) return '';

  return symbol2path ( symbol, node, size, symbols );

};

const node2path = ( node: Node, size: number, symbols: Record<string, NodeElement> ): string => {

  if ( node.type === 'root' ) {

    return children2path ( node.children, size, symbols );

  } else if ( node.type === 'element' ) {

    const {name} = node;

    if ( name === 'circle' ) {

      return circle2path ( node );

    } else if ( name === 'ellipse' ) {

      return ellipse2path ( node );

    } else if ( name === 'g' ) {

      return g2path ( node, size, symbols );

    } else if ( name === 'line' ) {

      return line2path ( node );

    } else if ( name === 'path' ) {

      return path2path ( node);

    } else if ( name === 'polyline' || name === 'polygon' ) {

      return poly2path ( node );

    } else if ( name === 'rect' ) {

      return rect2path ( node );

    } else if ( name === 'svg' ) {

      return svg2path ( node, size, symbols );

    } else if ( name === 'use' ) {

      return use2path ( node, size, symbols );

    } else if ( name === 'defs' || name === 'symbol' || name === 'style' || name === 'title' || name === 'desc' || name === 'metadata' || name === 'clipPath' || name === 'mask' || name === 'pattern' || name === 'linearGradient' || name === 'radialGradient' || name === 'filter' || name === 'marker' ) {

      return '';

    } else {

      throw new Error ( `Unsupported node type: "${name}"` );

    }

  } else {

    return '';

  }

};

const node2symbols = ( node: Node, symbols: Record<string, NodeElement> = {} ): Record<string, NodeElement> => {

  if ( node.type === 'root' || node.type === 'element' ) {

    if ( node.type === 'element' && node.name === 'symbol' ) {

      const id = `${node.attributes['id'] || ''}`;

      symbols[id] = node;

    }

    for ( const child of node.children ) {

      node2symbols ( child, symbols );

    }

  }

  return symbols;

};

/* MAIN */

const getPath = ( svg: string, size: number ): string => {

  const root = XML.parse ( svg );
  const symbols = node2symbols ( root );

  return node2path ( root, size, symbols );

};

/* EXPORT */

export default getPath;
