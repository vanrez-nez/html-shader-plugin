const glob = require("glob")
const fs = require('fs');
const path = require('path');
const glsl = require('glslify');
const cheerio = require('cheerio');

function findShaders(cb, pattern) {
  const shaders = [];
  glob(pattern, (err, files) => {
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const info = path.parse(file);
      const absPathFile = path.resolve(file);
      const type = info.ext === '.fs' ? 'fragment' : 'vertex';
      let name = info.name;
      // look up for pragma keyword to override name
      const matchName = content.trim().match(/^#pragma\sshader-loader\s(.+)/);
      if (matchName !== null && typeof matchName[1] === 'string') {
        name = matchName[1].trim();
      }
      shaders.push({
        type,
        name,
        file: absPathFile,
        content: glsl(content),
      });
    });
    cb(shaders);
  });
}

function getHtml(shaders) {
  return shaders.reduce((acc, sh) => {
    acc += `
    <script type='x-shader/x-${sh.type}' id='${sh.type}-${sh.name}'>
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
        }, `${this.path}/**/*.@(fs|vs)`);
      });
    });
  }
}

module.exports = HtmlShaderPlugin;