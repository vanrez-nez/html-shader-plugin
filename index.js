const glob = require("glob")
const fs = require('fs');
const path = require('path');
const glsl = require('glslify');
const cheerio = require('cheerio');

const NEW_LINE_RE = /\r?\n/
const PRAGMA_RE = /^#pragma\sshader-loader\s(.+)/

function parseContent(content, defaultName) {
  const lines = content.split(NEW_LINE_RE);
  // extract pragma declaration for name
  const pragmaName = lines.find(line => PRAGMA_RE.test(line));
  // remove pragma declaration for name
  const cleanLines = lines.filter(line => !PRAGMA_RE.test(line));
  let name = defaultName;
  // replace name if declaration found
  if (pragmaName) {
    let match = pragmaName.match(PRAGMA_RE);
    name = (match[1] || '').trim();
  }
  return {
    name,
    // preprocess glslfy declarations
    content: glsl(cleanLines.join('\n')),
  };
}

function findShaders(cb, pattern) {
  const shaders = [];
  glob(pattern, (err, files) => {
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const info = path.parse(file);
      const absPathFile = path.resolve(file);
      const type = /frag$|fs$/.test(info.ext) ? 'fragment' : 'vertex';
      let parsedContent = parseContent(content, info.name);
      shaders.push({
        type,
        file: absPathFile,
        name: parsedContent.name,
        content: parsedContent.content,
      });
    });
    cb(shaders);
  });
}

function getHtml(shaders) {
  return shaders.reduce((acc, sh) => {
    acc += `
    <script type='x-shader/x-${sh.type}' id='${sh.name}'>
      ${sh.content}
    </script>`;
    return acc;
  }, '');
}

class HtmlShaderPlugin {
  constructor(options) {
    this.path = options.path;
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('HtmlShaderPlugin', compilation => {
      compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tapAsync('HtmlShaderPlugin', (data, cb) => {
        findShaders( shaders => {
          shaders.forEach( shader => {
            compilation.fileDependencies.add(shader.file);
          });
          const $ = cheerio.load(data.html);
          $('body').prepend(getHtml(shaders));
          data.html = $.html();
          cb();
        }, `${this.path}/**/*.@(fs|vs|frag|vert)`);
      });
    });
  }
}

module.exports = HtmlShaderPlugin;
