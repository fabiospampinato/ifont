
/* IMPORT */

import ifont from '.';
import {ICON_NAMES_SPLIT_CHAR, ICON_NAMES_SPLIT_RE} from './constants';
import {castArray, without} from './utils';
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
          '@font-face {font-family:{{FONT_NAME}};font-style:normal;font-weight:400;font-display:block;src:url({{FONT_FILE}}) format("opentype")}' +
          'body{display:flex;flex-wrap:wrap;gap:6px}' +
          'body[data-view="wrapped"] #icons-wrapped{display:flex;flex-wrap:wrap;gap:6px}' +
          'body[data-view="unwrapped"] #icons-unwrapped{display:flex;flex-wrap:wrap;gap:6px}' +
          'body[data-view="both"] #icons-wrapped{display:flex;flex-wrap:wrap;gap:6px}' +
          'body[data-view="both"] #icons-unwrapped{display:flex;flex-wrap:wrap;gap:6px}' +
          '#icons-wrapped,#icons-unwrapped{display:none}' +
          '#toolbar{position:sticky;top:0;left:0;right:0;z-index:10;display:flex;align-items:center;gap:8px;padding:8px 12px;background:#fff;border-bottom:1px solid #ccc;box-sizing:border-box;width:100%}' +
          '#toolbar label{font:14px sans-serif}' +
          '#view{font:14px sans-serif;padding:2px 6px}' +
          '.icon{display:inline-block;vertical-align:middle;font-family:{{FONT_NAME}};font-weight:400;font-style:normal;font-size:48px;width:48px;height:48px;border:1px solid #000;line-height:1;letter-spacing:normal;text-transform:none;word-wrap:normal;white-space:nowrap;direction:ltr;overflow:hidden;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;-moz-osx-font-smoothing:grayscale;font-feature-settings:"liga"}' +
        '</style>' +
      '</head>' +
      '<body data-view="wrapped">' +
        '<div id="toolbar">' +
          '<label for="view">View:</label>' +
          '<select id="view">' +
            '<option value="wrapped">wrapped</option>' +
            '<option value="unwrapped">unwrapped</option>' +
            '<option value="both">both</option>' +
          '</select>' +
        '</div>' +
        '<div id="icons-wrapped">' +
          '{{ICONS_WRAPPED}}' +
        '</div>' +
        '<div id="icons-unwrapped">' +
          '<span class="icon" style="width: auto; height: auto; white-space: break-spaces;">' +
            '{{ICONS_UNWRAPPED}}' +
          '</span>' +
        '</div>' +
        '<script>' +
          '(function(){var s=document.getElementById("view");var b=document.body;b.setAttribute("data-view",s.value);s.addEventListener("change",function(){b.setAttribute("data-view",s.value)});})();' +
        '</script>' +
      '</body>' +
    '</html>'
  );

  const iconsEntities = icons.flatMap ( icon => castArray ( icon.name ).map ( chars2entities ) );
  const iconsWrapped = icons.flatMap ( icon => castArray ( icon.name ).map ( name => `<i class="icon" title="${chars2entities ( name )}">${chars2entities ( name )}</i>` ) ).join ( '' );
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

    const name = castArray ( icon.name ).join ( ICON_NAMES_SPLIT_CHAR );
    const iconsWithout = without ( icons, icon );
    const fontWithout = ifont ({ icons: iconsWithout, size: iconSize });
    const fontWithoutSize = fontWithout.byteLength;
    const size = ( fontSize - fontWithoutSize );

    return { name, size };

  });

};

const name2names = ( name: string ): string[] => {

  return name.split ( ICON_NAMES_SPLIT_RE ).filter ( Boolean ).map ( unicode2chars );

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

export {char2entity, chars2entities, icons2preview, icons2stats, name2names, unicode2chars};
