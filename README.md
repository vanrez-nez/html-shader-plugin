# html-shader-plugin
Webpack plugin to inject shader files into the project template with [glslify](https://github.com/glslify/glslify) support.


#### Requirements
* html-webpack-plugin

#### Installation
```shell
npm install html-webpack-plugin html-shader-plugin --save-dev
```
or
```
npm i html-webpack-plugin html-shader-plugin -D
```

#### Usage:

for webpack.config.js:
```javascript
const HtmlShaderPlugin = require('html-shader-plugin');

// config example
module.exports = {
  entry: {
  //...
  plugins: [
    //...
    new HtmlWebpackPlugin(),
    new HtmlShaderPlugin({
      path: './src/shaders',
    }),
    //...
  ]
}

```

#### Example:
Placing the following files for example:
```
./src/shaders/someshader/test.fs
./src/shaders/someshader/test.vs
```

Will output an `index.html` like this:
```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>HTML Shader Plugin</title>
</head>
<body>
  <script type="x-shader/x-fragment" id="fragment-test">
      fragment files content...
  </script>
  <script type="x-shader/x-vertex" id="vertex-test">
      vertex file contents...
  </script>
</body>
</html>
```
By default the name of the files is part of the id of the element. Is possible to override this by including a directive a the top the the shader file. The following shader will output a tag with the attribute `id="custom-id"`
```glsl
#pragma shader-loader custom-id

#ifdef GL_ES
  precision mediump float;
#endif

void main()
{
  ...
}
```

You can make use of the glslify includes as usual:
``` glsl
#pragma shader-loader custom-id
#pragma glslify: noise = require('glsl-noise/simplex/3d')

precision mediump float;
varying vec3 vpos;
void main () {
  gl_FragColor = vec4(noise(vpos*25.0),1);
}
```
