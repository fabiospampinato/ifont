
/* IMPORT */

import {ICON_PRECISION, ICON_SIZE} from './constants';
import svg2ttf from './svg2ttf';
import elementToPath from 'element-to-path';
import Commander from 'svg-path-commander';
import svgpath from 'svgpath';
import XML from 'xml-simple-parser';
import type {Node} from 'xml-simple-parser';
import type {Glyph, Icon} from './types';

/* MAIN */

const char2entity = ( char: string ): string => {

  return `&#x${char.charCodeAt ( 0 ).toString ( 16 )};`;

};

const chars2entities = ( chars: string ): string => {

  return chars.split ( '' ).map ( char2entity ).join ( '' );

};

const icon2glyph = ( icon: Icon ): Glyph => {

  const path = svg2path ( icon.content );
  const name = icon.name;

  return {path, name};

};

const icons2glyphs = ( icons: Icon[] ): Glyph[] => {

  return icons.map ( icon2glyph );

};

const icons2preview = ( icons: Icon[], font: string ): string => {

  const TEMPLATE = (
    '<!DOCTYPE html>' +
    '<html>' +
      '<head>' +
        '<meta charset="utf-8" />' +
        '<title>iFont | Preview</title>' +
        '<style>' +
        '@font-face {font-family:FONT_NAME;font-style:normal;font-weight:400;font-display:block;src:url(font.ttf) format("opentype")}body{display:flex;flex-wrap:wrap;gap:6px}i.icon{display:inline-block;vertical-align:middle;font-family:FONT_NAME;font-weight:400;font-style:normal;font-size:48px;width:48px;height:48px;border:1px solid #000;line-height:1;letter-spacing:normal;text-transform:none;word-wrap:normal;white-space:nowrap;direction:ltr;overflow:hidden;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;-moz-osx-font-smoothing:grayscale;font-feature-settings:"liga"}' +
        '</style>' +
      '</head>' +
      '<body>{{SAMPLES}}</body>' +
    '</html>'
  );

  const samples = icons.map ( icon => `<i class="icon" title="${icon.name}">${icon.name}</i>` ).join ( '' );
  const template = TEMPLATE.replace ( '{{SAMPLES}}', samples ).replace ( 'font.ttf', font );

  return template;

};

const icons2svg = ( icons: Icon[], family: 'iFont' ): string => { //TODO: Maybe publish this as a standalone package

  return (
    '<?xml version="1.0" standalone="no"?>\n' +
    '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n' +
    '<svg xmlns="http://www.w3.org/2000/svg">\n' +
    '<defs>\n' +
    `\t<font id="${family}" horiz-adv-x="${ICON_SIZE}">\n` +
    `\t\t<font-face font-family="${family}" units-per-em="${ICON_SIZE}" ascent="${ICON_SIZE}" descent="0" />\n` +
    '\t\t<missing-glyph horiz-adv-x="0" />\n' +
    icons2glyphs ( icons ).map ( glyph => (
      `\t\t<glyph unicode="${chars2entities ( glyph.name )}" horiz-adv-x="${ICON_SIZE}" d="${glyph.path}" />\n`
    )).join ( '' ) +
    '\t</font>\n' +
    '</defs>\n' +
    '</svg>\n'
  );

};

const icons2ttf = ( icons: Icon[] ): Uint8Array => {

  const glyphs = icons2glyphs ( icons );

  return svg2ttf ( glyphs ).buffer;

};

const node2path = ( node: Node ): string => {

  if ( node.type === 'root' ) {

    return node.children.map ( node2path ).join ( '' );

  } else if ( node.type === 'element' ) {

    if ( node.name === 'svg' ) {

      const viewport = String ( node.attributes['viewBox'] ).split ( ' ' ).map ( Number );
      const paths = node.children.map ( node2path );
      const path = paths.join ( '' );

      if ( !path ) return '';

      return Commander.pathToString ( Commander.transformPath ( path, { translate: [-viewport[0], ICON_SIZE - viewport[1]], scale: [ICON_SIZE / viewport[2], - ICON_SIZE / viewport[3]], origin: [0, 0] } ), ICON_PRECISION );

    } else if ( node.name === 'g' ) {

      const transform = node.attributes['transform'];
      const paths = node.children.map ( node2path );
      const path = paths.join ( '' );

      if ( transform ) {

        return svgpath ( path ).transform ( String ( transform ) ).toString ();

      } else {

        return path;

      }

    } else if ( node.name === 'path' ) {

      return String ( node.attributes['d'] || '' );

    } else if ( node.name === 'rect' || node.name === 'circle' || node.name === 'ellipse' || node.name === 'line' || node.name === 'polyline' || node.name === 'polygon' ) {

      return elementToPath ( node );

    } else {

      throw new Error ( `Unsupported node type: "${node.name}"` );

    }

  } else {

    return '';

  }

};

const svg2path = ( svg: string ): string => { //TODO: Maybe publish this as a standalone package

  return node2path ( XML.parse ( svg ) );

};

/* EXPORT */

export {char2entity, chars2entities, icon2glyph, icons2glyphs, icons2preview, icons2svg, icons2ttf, node2path, svg2path};
