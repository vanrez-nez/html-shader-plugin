# html-webpack-plugin


Webpack plugin to inject shader files into the project template.


#### Requirements
* html-webpack-plugin


#### Installation
```shell

npm install html-webpack-plugin --save-dev

#or

npm i html-webpack-plugin -D

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

Will output an index.html like this:
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
By default the name of the files is part of the id of the element. Is possible to override this by including a directive a the top the the shader file like so
```glsl
#pragma shader-loader custom-name

#ifdef GL_ES
  precision mediump float;
#endif

void main()
{
  ...
}
```
with this the id will now be named `vertex-custom-name` or `fragment-custom-name` depending of the extension of the file.