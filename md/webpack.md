# webpack全指南（含webpack2）
- [配置文件的基本构成](#配置文件的基本构成)
- [基本用法](#基本用法)
  - [使用loader](#使用loader)
  - [本地起服务](#本地起服务)
  - [hot及inline](#hot及inline)
  - [将业务代码和引用代码分离](#将业务代码和引用代码分离)
  - [处理样式](#处理样式)
  - [分离打包样式](#分离打包样式)
  - [打包优化](#打包优化)
  - [单页面应用](#单页面应用)
  - [完整配置文件示例](#完整配置文件示例)
  - [Content Base](#content-base)
  - [Proxy](#proxy)
  - [webpack2-tree-shaking](#webpack2-tree-shaking)


## 配置文件的基本构成

```javascript
// webpack.config.js
const config = {
  // js entry file
  entry: ['./main.js'],

  // pack output
  output: {
    path: '',
    publicPath: '',
    filename: '',
  },

  // The base directory for resolving the entry option
  context: path.resolve(__dirname, '../src'),

  // http://webpack.github.io/docs/configuration.html#devtool
  devtool: 'source-map',

  devServer: {},

  // Options affecting the normal modules
  module: {
      // webpack 1.0版本
      loaders: [
          {
            test: /\.jsx?$/,
            loader: 'babel',
            include: '',
            exclude: /node_modules/
          },
          ...
      ],
      // webpack 2.0版本
      rules: [
          {
            test: /\.jsx?$/,
            include: [
              path.resolve(__dirname, '../src'),
              path.resolve(__dirname, '../components'),
            ],
            loader: 'babel',
            options: babelConfig,
          },
          ...
      ],
  },
  plugins: [],
};

module.exports = config;
```

## 基本用法

### 使用loader

```javascript
// js文件中require
require("url-loader?mimetype=image/png!./file.png");

// 或者在配置文件中使用
{
    test: /\.png$/,
    loader: "url-loader?mimetype=image/png"
}
// or
{
    test: /\.png$/,
    loader: "url-loader",
    query: { mimetype: "image/png" }
}
```

### 本地起服务

> webpack dev server

```javascript
var path = require("path");
module.exports = {
  entry: {
    app: ["./app/main.js"]
  },
  output: {
    path: path.resolve(__dirname, "build"),
    publicPath: "/assets/",
    filename: "bundle.js"
  }
};
```
然后在命令行中输入
```bash
$ webpack-dev-server
```

或者在js文件中使用

```javascript
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  historyApiFallback: true
}).listen(3000, 'localhost', function (err, result) {
  if (err) {
    return console.log(err);
  }

  console.log('Listening at http://localhost:3000/');
});
```

publicPath指明本地服务器访问位置，采用以上的配置，最终打包的文件为localhost:8080/assets/bundle.js.

### hot及inline

**实现页面Automatic Refresh 及 模块热替换 Hot Module Replacement**

```javascript
// 1. 添加 HotModuleReplacementPlugin

// 以下命令可以自动添加 HotModuleReplacementPlugin
$ webpack-dev-server --hot

// 也可选择在配置中手动添加plugin
plugins: [
    new webpack.HotModuleReplacementPlugin(),
],

// 同时配置
devServer: { hot: true }

// 2. 使用dev-server的特殊管理代码

// 以下命令将自动启用管理代码 webpack/hot/dev-server
$ webpack-dev-server --inline

// 也可以在入口文件中手动添加相应配置
entry: [
    'webpack-dev-server/client?http://0.0.0.0:3000', // WebpackDevServer host and port
    'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
    './index.js',
  ]

// 对于分离vendor的entry：
entry: {
    main: [
        'webpack-dev-server/client?http://0.0.0.0:3000',
        'webpack/hot/only-dev-server',
        './main.js',
    ],
    vendor: ['core-js', 'react', 'react-dom'],
  }

```

> 注：在最终打包上线的js中不需要webpack-dev-server/client以及webpack/hot/only-dev-server，所以最合适的写法是根据不同npm任务动态的添加。

当项目中用到react时，想热更新组件的话，你还需要额外的两个步骤

- 使用 HMR 替换根组件

```javascript
import React from 'react';
import { render } from 'react-dom';
import RootContainer from './containers/rootContainer.js';

render(<RootContainer />, document.getElementById('react-root'));

// Add the following code to accept changes to your RootContainer, or any of its descendants:

 if (module.hot) {
   module.hot.accept('./containers/rootContainer.js', () => {
     const NextRootContainer = require('./containers/rootContainer.js').default;
     render(<NextRootContainer />, document.getElementById('react-root'));
   }
 }
```
- 利用React Hot Loader保存状态

```javascript
//  在.babelrc中添加:
  {
    "plugins": [ "react-hot-loader/babel" ]
  }

// 同时更新入口
 entry: [
    'react-hot-loader/patch', // RHL patch
    '.index.js' // Your appʼs entry point
  ]

```



### 将业务代码和引用代码分离

```javascript
var webpack = require("webpack");

module.exports = {
  entry: {
    app: "./app.js",
    // 分离出引用代码
    vendor: ["jquery", "underscore", ...],
  },
  output: {
    filename: "bundle.js"
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin(/* chunkName= */"vendor", /* filename= */"vendor.bundle.js")
  ]
};
```

### 处理样式

```javascript
{
    // ...
    module: {
        loaders: [
            { test: /\.css$/, loader: "style-loader!css-loader" }
        ]
    }
}
// or
{
    // ...
    module: {
        loaders: [{
         test: /\.css$/,
         loaders: ["style-loader", "css-loader"]
        }]
    }
}
```

### 分离打包样式

一个多入口的例子，同样适用于单入口

```javascript
var ExtractTextPlugin = require("extract-text-webpack-plugin");
module.exports = {
    // The standard entry point and output config
    entry: {
        posts: "./posts",
        post: "./post",
        about: "./about"
    },
    output: {
        filename: "[name].js",
        chunkFilename: "[id].js"
    },
    module: {
        loaders: [
            // Extract css files
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader")
            },
            // Optionally extract less files
            // or any other compile-to-css language
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader")
            }
            // You could also use other loaders the same way. I. e. the autoprefixer-loader
        ]
    },
    // Use the plugin to specify the resulting filename (and add needed behavior to the compiler)
    plugins: [
        new ExtractTextPlugin("[name].css")
    ]
}
```

最终生成的打包文件为：
* posts.js posts.css
* post.js post.css
* about.js about.css
* 1.js 2.js (contain embedded styles)

**所有样式单独打包**

只需设置allChunks为true

```
plugins: [
    new ExtractTextPlugin("style.css", {
        allChunks: true
    })
]
```

### 打包优化

**plugin**
- 压缩: new webpack.optimize.UglifyJsPlugin()
常用压缩配置：

```javascript
new webpack.optimize.UglifyJsPlugin({
  sourceMap: true,
  output: {
    comments: false,
  },
  compress: {
    drop_console: isVerbose,
    warnings: false,
  },
})
```


- 动态改变包的id的分布，使得经常使用的id能有较小的长度: new webpack.optimize.OccurrenceOrderPlugin()

- 包数量限制：new webpack.optimize.LimitChunkCountPlugin({maxChunks: 15})

- 包大小限制：new webpack.optimize.MinChunkSizePlugin({minChunkSize: 10000})

### 单页面应用及多页面应用

**单页面应用**

js是根据router加载的，每个页面只需包含和router和库相关的代码，以及当前页面内所需的代码，即在各个路由对应的入口文件中按需加载js:

```javascript
// es2015
const Route = await new Promise((resolve) => {
  require.ensure([], require => {
    resolve(require('./Foo').default);
  }, 'foo');
});


// 最终会打包分离出Foo页面对应的[foo].js，此js只有在访问此页面时才会加载

```

**多页面应用**

配置多个入口就好，如果多个页面有共同的模块可以采用CommonsChunkPlugin打包出一个公用包

**assets.json**

最终生成的打包文件需要引入html中，可以通过assets-webpack-plugin 来生成一个json文件来记录引入文件的情况

```javascript
plugins: [
  function() {
    this.plugin("done", function(stats) {
      require("fs").writeFileSync(
        path.join(__dirname, "..", "stats.json"),
        JSON.stringify(stats.toJson()));
    });
  }
]
或者
new AssetsPlugin({
    path: path.resolve(__dirname, '../public/dist'),
    filename: 'assets.json',
    prettyPrint: true,
}),
```

### 完整配置文件示例

```javascript
const path = require('path');
const webpack = require('webpack');
const AssetsPlugin = require('assets-webpack-plugin');
const pkg = require('../package.json');

const isDebug = global.DEBUG === false ? false : !process.argv.includes('--release');
const isVerbose = process.argv.includes('--verbose') || process.argv.includes('-v');
const useHMR = !!global.HMR; // Hot Module Replacement (HMR)
const babelConfig = Object.assign({}, pkg.babel, {
  babelrc: false,
  cacheDirectory: useHMR,
});

const config = {
  entry: {
    main: ['./main.js'],
    vendor: ['core-js', 'react', 'react-dom'],
  },

  output: {
    path: path.resolve(__dirname, '../public/dist'),
    publicPath: '/dist/',
    filename: isDebug ? 'main.js?[hash]' : 'main.[hash].js',

  },
  // The base directory for resolving the entry option
  context: path.resolve(__dirname, '../src'),
  // Developer tool to enhance debugging, source maps
  // http://webpack.github.io/docs/configuration.html#devtool
  devtool: isDebug ? 'source-map' : false,

  // What information should be printed to the console
  stats: {
    colors: true,
    reasons: isDebug,
    hash: isVerbose,
    version: isVerbose,
    timings: true,
    chunks: isVerbose,
    chunkModules: isVerbose,
    cached: isVerbose,
    cachedAssets: isVerbose,
  },


  // Options affecting the normal modules
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, '../src'),
          path.resolve(__dirname, '../components'),
        ],
        loader: 'babel-loader',
        options: babelConfig,
      },
      {
        test: /\.css/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: isDebug,
              importLoaders: true,
              // CSS Modules https://github.com/css-modules/css-modules
              modules: true,
              localIdentName: isDebug ? '[name]_[local]_[hash:base64:3]' : '[hash:base64:4]',
              // CSS Nano http://cssnano.co/options/
              minimize: !isDebug,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              config: './tools/postcss.config.js',
            },
          },
        ],
      },
      {
        test: /\.scss/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'sass-loader',
          },
          {
            loader: 'postcss-loader',
            options: {
              config: './tools/postcss.config.js',
            },
          },
        ],
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)$/,
        loader: 'url-loader',
        options: {
          limit: isDebug ? 10000 : 1000,
        },
      },
      {
        test: /\.(eot|ttf|wav|mp3)$/,
        loader: 'file-loader',
      },
    ],
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({ name: 'vendor', filename: 'vendor.bundle.js' }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': isDebug ? '"development"' : '"production"',
      __DEV__: isDebug,
    }),
    new AssetsPlugin({
      path: path.resolve(__dirname, '../public/dist'),
      filename: 'assets.json',
      prettyPrint: true,
    }),
  ],
};

function addPlugin(configObj) {
  // Optimize the bundle in release (production) mode
  if (!isDebug) {
    configObj.plugins.push(new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      output: {
        comments: false,
      },
      compress: {
        drop_console: isVerbose,
        warnings: false,
      },
    }));
    configObj.plugins.push(new webpack.optimize.AggressiveMergingPlugin());
  }

  // Hot Module Replacement (HMR) + React Hot Reload
  if (isDebug && useHMR) {
    babelConfig.plugins.unshift('react-hot-loader/babel');
    configObj.entry.main.unshift('react-hot-loader/patch', 'webpack-hot-middleware/client');
    configObj.plugins.push(new webpack.HotModuleReplacementPlugin());
    configObj.plugins.push(new webpack.NoEmitOnErrorsPlugin());
  }
}

addPlugin(config);

module.exports = config;

```

### Content Base

根据上述的webpack配置, 生成的bundle为 localhost:8080/assets/bundle.js.
而webpack-dev-server会服务当前目录的文件，因此为了加载此文件，你需要在当前路径下添加一个index.html。

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Document</title>
</head>
<body>
  <script src="assets/bundle.js"></script>
</body>
</html>
```

而配置了content base后，webpack-dev-server 将服务content base 指向的目录，配置方法如下：

```javascript
devServer: {
     // 静态资源的目录 相对路径,相对于当前路径 默认为当前config所在的目录
    contentBase: path.resolve(__dirname, '/build'),
    ...
  },
```

### Proxy

Webpack dev server 利用 http-proxy-middleware 将请求proxy 到特定的server.

```
proxy: {
  '/api': {
    target: 'https://other-server.example.com',
    secure: false
  }
}

// In webpack.config.js
{
  devServer: {
    proxy: {
      '/api': {
        target: 'https://other-server.example.com',
        secure: false
      }
    }
  }
}

// Multiple entry
proxy: [
  {
    context: ['/api-v1/**', '/api-v2/**'],
    target: 'https://other-server.example.com',
    secure: false
  }
]
```

### webpack2-tree-shaking

**Webpack2 tree-shaking 与 es6**

Tree-shaking，即从模块包中排除未使用的 exports 项。

Webpack2 可以解析并且理解所有 ES6 代码，但只有 import 和 export 语句会被 Webpack 转译为 ES5，这时我们需要启用babal对其他es6的代码进行兼容处理：

```
{
  presets: ['es2015'],
}
```
这一 preset 包含了 transform-es2015-modules-commonjs 这个插件，这意味着 Babel 会输出 CommonJS 规范的模块，这时 Webpack 无法进行 Tree-shaking。
因此我们需要在presets中干掉module相关的转换配置

```
"presets": [
  [
    "es2015",
    {
      "modules": false
    }
  ]
],
```

**webpack-dev-server CLI参数列表**

* --content-base <file/directory/url/port>: base path for the content.
* --quiet: don’t output anything to the console.
* --no-info: suppress boring information.
* --colors: add some colors to the output.
* --no-colors: don’t use colors in the output.
* --compress: use gzip compression.
* --host <hostname/ip>: hostname or IP. 0.0.0.0 binds to all hosts.
* --port <number>: port.
* --inline: embed the webpack-dev-server runtime into the bundle.
* --hot: adds the HotModuleReplacementPlugin and switch the server to hot mode. Note: make sure you don’t add HotModuleReplacementPlugin twice.
* --hot --inline also adds the webpack/hot/dev-server entry.
* --public: overrides the host and port used in --inline mode for the client (useful for a VM or Docker).
* --lazy: no watching, compiles on request (cannot be combined with --hot).
* --https: serves webpack-dev-server over HTTPS Protocol. Includes a self-signed certificate that is used when serving the requests.
* --cert, --cacert, --key: Paths the certificate files.
* --open: opens the url in default browser (for webpack-dev-server versions > 2.0).
* --history-api-fallback: enables support for history API fallback.
* --client-log-level: controls the console log messages shown in the browser. Use error, warning, info or none.
