const glob = require("glob")
const fs = require('fs');
const path = require('path');

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
      const matchName = content.trim().match(/^#pragma\sshader-loader(.+\s)/);
      if (matchName !== null && typeof matchName[1] === 'string') {
        name = matchName[1].trim();
      }
      shaders.push({ file: absPathFile, name, content, type });
    });
    cb(shaders);
  });
}


class HtmlShaderPlugin {
  constructor(options) {
    this.path = options.path;
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('HtmlShaderPlugin', compilation => {
      compilation.hooks.htmlWebpackPluginBeforeHtmlGeneration.tapAsync('HtmlShaderPlugin', (data, cb) => {
        findShaders( shaders => {
          shaders.forEach( shader => {
            compilation.fileDependencies.add(shader.file);
          });
          data.plugin.options.shaders = shaders;
          cb();
        }, `${this.path}/**/*.@(fs|vs)`);
      });
    });
  }
}

module.exports = HtmlShaderPlugin;