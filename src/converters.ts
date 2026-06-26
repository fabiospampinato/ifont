
/* IMPORT */

import ifont from '.';
import {without} from './utils';
import type {Icon, Stat} from './types';

/* MAIN */

const char2entity = ( char: string ): string => {

  return `&#x${char.charCodeAt ( 0 ).toString ( 16 )};`;

};

const chars2entities = ( chars: string ): string => {

  return chars.split ( '' ).map ( char2entity ).join ( '' );

};

const icons2preview = ( icons: Icon[], font: string ): string => {

  const TEMPLATE = (
    '<!DOCTYPE html>' +
    '<html>' +
      '<head>' +
        '<meta charset="utf-8" />' +
        '<title>iFont | Preview</title>' +
        '<style>' +
        '@font-face {font-family:{{FONT_NAME}};font-style:normal;font-weight:400;font-display:block;src:url({{FONT_FILE}}) format("opentype")}body{display:flex;flex-wrap:wrap;gap:6px}i.icon{display:inline-block;vertical-align:middle;font-family:{{FONT_NAME}};font-weight:400;font-style:normal;font-size:48px;width:48px;height:48px;border:1px solid #000;line-height:1;letter-spacing:normal;text-transform:none;word-wrap:normal;white-space:nowrap;direction:ltr;overflow:hidden;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;-moz-osx-font-smoothing:grayscale;font-feature-settings:"liga"}' +
        '</style>' +
      '</head>' +
      '<body>{{ICONS_WRAPPED}}</body>' +
      '<i class="icon" style="width: auto; height: auto; white-space: break-spaces; margin-top: 100px;">{{ICONS_UNWRAPPED}}</i>' +
    '</html>'
  );

  const iconsEntities = icons.map ( icon => chars2entities ( icon.name ) );
  const iconsWrapped = icons.map ( ( icon, i ) => `<i class="icon" title="${iconsEntities[i]}">${iconsEntities[i]}</i>` ).join ( '' );
  const iconsUnwrapped = iconsEntities.join ( '\u200b' );

  const templateWithWrapped = TEMPLATE.replace ( '{{ICONS_WRAPPED}}', iconsWrapped );
  const templateWithUnwrapped = templateWithWrapped.replace ( '{{ICONS_UNWRAPPED}}', iconsUnwrapped );
  const templateWithFont = templateWithUnwrapped.replaceAll ( '{{FONT_NAME}}', 'iFont' ).replace ( '{{FONT_FILE}}', font );

  return templateWithFont;

};

const icons2stats = ( icons: Icon[], iconSize: number ): Stat[] => {

  const font = ifont ({ icons, size: iconSize });
  const fontSize = font.byteLength;

  return icons.map ( icon => {

    const name = icon.name;
    const iconsWithout = without ( icons, icon );
    const fontWithout = ifont ({ icons: iconsWithout, size: iconSize });
    const fontWithoutSize = fontWithout.byteLength;
    const size = ( fontSize - fontWithoutSize );

    return { name, size };

  });

};

const unicode2chars = ( unicode: string ): string => {

  const unicodeRe = /([uU][a-fA-F0-9]{4}|[0-9][a-fA-F0-9]{3})/g;
  const unicodesRe = /^(?:([uU][a-fA-F0-9]{4}|[0-9][a-fA-F0-9]{3}))+$/g;

  if ( unicodesRe.test ( unicode ) ) { // Unicode codepoint(s)

    return unicode.replaceAll ( unicodeRe, unicode => String.fromCharCode ( parseInt ( unicode.slice ( -4 ), 16 ) ) );

  } else { // Ligature

    return unicode;

  }

};

/* EXPORT */

export {char2entity, chars2entities, icons2preview, icons2stats, unicode2chars};
